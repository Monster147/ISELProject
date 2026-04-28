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
            repoOccurrence.clear()
        }
    }

    private fun setupUserAndOccurrence(): Pair<Int, Int> {
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
                    occurrenceType = 1,
                    occurrenceInfo = json("""{}"""),
                )

            user.id to occurrence.id
        }
    }

    @Test
    fun `createEvidence creates evidence`() {
        val (userId, occurrenceId) = setupUserAndOccurrence()

        val evidence =
            evidenceService.createEvidence(
                type = "image",
                file = file(),
                location = "Lisboa",
                description = "desc",
                reporterId = userId,
                occurrenceId = occurrenceId,
            ).let {
                check(it is Success)
                it.value
            }

        assertEquals("Lisboa", evidence.location)
    }

    @Test
    fun `createEvidence fails when user not found`() {
        val (_, occurrenceId) = setupUserAndOccurrence()

        val result =
            evidenceService.createEvidence(
                "image",
                file = file(),
                "Lisboa",
                "desc",
                reporterId = 999,
                occurrenceId = occurrenceId,
            )

        assertIs<Either.Left<*>>(result)
        assertIs<EvidenceError.ReporterNotFound>(result.value)
    }

    @Test
    fun `createEvidence fails when occurrence not found`() {
        val (userId, _) = setupUserAndOccurrence()

        val result =
            evidenceService.createEvidence(
                "image",
                file = file(),
                "Lisboa",
                "desc",
                reporterId = userId,
                occurrenceId = 999,
            )

        assertIs<Either.Left<*>>(result)
        assertIs<EvidenceError.OccurrenceNotFound>(result.value)
    }

    @Test
    fun `findById returns evidence`() {
        val (userId, occurrenceId) = setupUserAndOccurrence()

        val created =
            evidenceService.createEvidence(
                "image",
                file = file(),
                "Porto",
                "desc",
                userId,
                occurrenceId,
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
    fun `findByOccurrenceId returns evidences`() {
        val (userId, occurrenceId) = setupUserAndOccurrence()

        evidenceService.createEvidence("image", file = file(), "Lisboa", "d", userId, occurrenceId)
        evidenceService.createEvidence("image", file = file(), "Porto", "d", userId, occurrenceId)

        val result = evidenceService.findByOccurrenceId(occurrenceId)

        assertEquals(2, result.size)
    }

    @Test
    fun `findByReporterId returns evidences`() {
        val (userId, occurrenceId) = setupUserAndOccurrence()

        evidenceService.createEvidence("image", file = file(), "Lisboa", "d", userId, occurrenceId)
        evidenceService.createEvidence("image", file = file(), "Porto", "d", userId, occurrenceId)

        val result = evidenceService.findByReporterId(userId)

        assertEquals(2, result.size)
    }

    @Test
    fun `findByType returns evidences`() {
        val (userId, occurrenceId) = setupUserAndOccurrence()

        val typeImage = "image"
        val typeVideo = "video"

        evidenceService.createEvidence(typeImage, file = file(), "Lisboa", "d", userId, occurrenceId)
        evidenceService.createEvidence(typeVideo, file = file(), "Porto", "d", userId, occurrenceId)

        val result = evidenceService.findByType(typeImage)

        assertEquals(1, result.size)
    }

    @Test
    fun `findByLocation returns evidences`() {
        val (userId, occurrenceId) = setupUserAndOccurrence()

        evidenceService.createEvidence("a", file = file(), "Lisboa", "d", userId, occurrenceId)
        evidenceService.createEvidence("b", file = file(), "Lisboa", "d", userId, occurrenceId)

        val result = evidenceService.findByLocation("Lisboa")

        assertEquals(2, result.size)
    }

    @Test
    fun `findAll returns all evidences`() {
        val (userId, occurrenceId) = setupUserAndOccurrence()

        evidenceService.createEvidence("a", file = file(), "Lisboa", "d", userId, occurrenceId)
        evidenceService.createEvidence("b", file = file(), "Porto", "d", userId, occurrenceId)

        val result = evidenceService.findAll()

        assertTrue(result.size >= 2)
    }

    @Test
    fun `deleteById removes evidence`() {
        val (userId, occurrenceId) = setupUserAndOccurrence()

        val created =
            evidenceService.createEvidence(
                "image",
                file = file(),
                "Lisboa",
                "d",
                userId,
                occurrenceId,
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
