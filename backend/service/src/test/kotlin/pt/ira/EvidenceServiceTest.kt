package pt.ira

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.mock.web.MockMultipartFile
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import pt.ira.interfaces.TransactionManager
import pt.ira.occurrence.OccurrenceType
import pt.ira.user.PasswordValidationInfo
import java.time.LocalDate
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertTrue

@SpringJUnitConfig(TestConfig::class)
class EvidenceServiceTest {
    @Autowired
    private lateinit var evidenceService: EvidenceService

    @Autowired
    private lateinit var trxManager: TransactionManager

    private val objectMapper = ObjectMapper()

    private fun json(value: String) = objectMapper.readTree(value)

    private fun file(
        name: String = "file.jpg",
        contentType: String = "image/jpeg",
        content: ByteArray = "dummy".toByteArray(),
    ): MockMultipartFile {
        return MockMultipartFile("file", name, contentType, content)
    }

    @BeforeEach
    fun reset() {
        trxManager.run {
            repoEvidence.clear()
            repoUsers.clear()
            repoReport.clear()
            repoOccurrence.clear()
        }
    }

    private fun setupUserAndReport(): Pair<Int, Int> {
        return trxManager.run {
            val user =
                repoUsers.createUser(
                    name = "user",
                    email = "user@mail.com",
                    passwordValidation = PasswordValidationInfo("pass"),
                    roles = emptyList(),
                )

            val occurrence =
                repoOccurrence.createOccurrence(
                    endDate = LocalDate.of(2030, 3, 30),
                    reporterId = user.id,
                    importance = OccurrenceType.NORMAL,
                    occurrenceType = json("""{"type":"base"}"""),
                    occurrenceInfo = json("""{}"""),
                )

            val report =
                repoReport.createReport(
                    creatorId = user.id,
                    occurrenceId = occurrence.id,
                    title = "title",
                    description = "desc",
                    type = occurrence.occurrenceType,
                    addons = json("""{}"""),
                    intervenors = occurrence.intervenors,
                )

            user.id to report.id
        }
    }

    @Test
    fun `createEvidence creates evidence`() {
        val (userId, reportId) = setupUserAndReport()

        val evidence =
            evidenceService.createEvidence(
                type = json("""{"type":"image"}"""),
                file = file(),
                location = "Lisboa",
                description = "desc",
                reporterId = userId,
                reportId = reportId,
            ).let {
                check(it is Success)
                it.value
            }

        assertEquals("Lisboa", evidence.location)
    }

    @Test
    fun `createEvidence fails when user not found`() {
        val (_, reportId) = setupUserAndReport()

        val result =
            evidenceService.createEvidence(
                json("""{"type":"x"}"""),
                file = file(),
                "Lisboa",
                "desc",
                reporterId = 999,
                reportId = reportId,
            )

        assertIs<Either.Left<*>>(result)
        assertIs<EvidenceError.ReporterNotFound>(result.value)
    }

    @Test
    fun `createEvidence fails when report not found`() {
        val (userId, _) = setupUserAndReport()

        val result =
            evidenceService.createEvidence(
                json("""{"type":"x"}"""),
                file = file(),
                "Lisboa",
                "desc",
                reporterId = userId,
                reportId = 999,
            )

        assertIs<Either.Left<*>>(result)
        assertIs<EvidenceError.ReportNotFound>(result.value)
    }

    @Test
    fun `findById returns evidence`() {
        val (userId, reportId) = setupUserAndReport()

        val created =
            evidenceService.createEvidence(
                json("""{"type":"video"}"""),
                file = file(),
                "Porto",
                "desc",
                userId,
                reportId,
            ).let {
                check(it is Success)
                it.value
            }

        val found =
            evidenceService.findById(created.id).let {
                check(it is Success)
                it.value
            }

        assertEquals(created.id, found.id)
    }

    @Test
    fun `findById fails if not found`() {
        val result = evidenceService.findById(999)

        assertIs<Either.Left<*>>(result)
        assertIs<EvidenceError.EvidenceNotFound>(result.value)
    }

    @Test
    fun `findByReportId returns evidences`() {
        val (userId, reportId) = setupUserAndReport()

        evidenceService.createEvidence(json("""{"type":"a"}"""), file = file(), "Lisboa", "d", userId, reportId)
        evidenceService.createEvidence(json("""{"type":"b"}"""), file = file(), "Porto", "d", userId, reportId)

        val result = evidenceService.findByReportId(reportId)

        assertEquals(2, result.size)
    }

    @Test
    fun `findByReporterId returns evidences`() {
        val (userId, reportId) = setupUserAndReport()

        evidenceService.createEvidence(json("""{"type":"a"}"""), file = file(), "Lisboa", "d", userId, reportId)
        evidenceService.createEvidence(json("""{"type":"b"}"""), file = file(), "Porto", "d", userId, reportId)

        val result = evidenceService.findByReporterId(userId)

        assertEquals(2, result.size)
    }

    @Test
    fun `findByType returns evidences`() {
        val (userId, reportId) = setupUserAndReport()

        val type = json("""{"type":"image"}""")

        evidenceService.createEvidence(type, file = file(), "Lisboa", "d", userId, reportId)
        evidenceService.createEvidence(json("""{"type":"video"}"""), file = file(), "Porto", "d", userId, reportId)

        val result = evidenceService.findByType(type)

        assertEquals(1, result.size)
    }

    @Test
    fun `findByLocation returns evidences`() {
        val (userId, reportId) = setupUserAndReport()

        evidenceService.createEvidence(json("""{"type":"a"}"""), file = file(), "Lisboa", "d", userId, reportId)
        evidenceService.createEvidence(json("""{"type":"b"}"""), file = file(), "Lisboa", "d", userId, reportId)

        val result = evidenceService.findByLocation("Lisboa")

        assertEquals(2, result.size)
    }

    @Test
    fun `findAll returns all evidences`() {
        val (userId, reportId) = setupUserAndReport()

        evidenceService.createEvidence(json("""{"type":"a"}"""), file = file(), "Lisboa", "d", userId, reportId)
        evidenceService.createEvidence(json("""{"type":"b"}"""), file = file(), "Porto", "d", userId, reportId)

        val result = evidenceService.findAll()

        assertTrue(result.size >= 2)
    }

    @Test
    fun `deleteById removes evidence`() {
        val (userId, reportId) = setupUserAndReport()

        val created =
            evidenceService.createEvidence(
                json("""{"type":"x"}"""),
                file = file(),
                "Lisboa",
                "d",
                userId,
                reportId,
            ).let {
                check(it is Success)
                it.value
            }

        val result = evidenceService.deleteById(created.id)

        assertIs<Success<Boolean>>(result)
        assertTrue(result.value)

        val find = evidenceService.findById(created.id)
        assertIs<Either.Left<*>>(find)
        assertIs<EvidenceError.EvidenceNotFound>(find.value)
    }

    @Test
    fun `deleteById fails if not found`() {
        val result = evidenceService.deleteById(999)

        assertIs<Either.Left<*>>(result)
        assertIs<EvidenceError.EvidenceNotFound>(result.value)
    }
}
