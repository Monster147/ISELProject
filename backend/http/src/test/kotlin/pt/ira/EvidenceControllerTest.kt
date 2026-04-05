package pt.ira

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.mock.web.MockMultipartFile
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import pt.ira.evindence.Evidence
import pt.ira.interfaces.TransactionManager
import pt.ira.model.evidence.CreateEvidenceInput
import pt.ira.occurrence.Occurrence
import pt.ira.occurrence.OccurrenceType
import pt.ira.user.PasswordValidationInfo
import java.time.LocalDate
import kotlin.run
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertNotNull

@SpringJUnitConfig(TestConfig::class)
class EvidenceControllerTest {
    @Autowired
    private lateinit var controller: EvidenceController

    @Autowired
    private lateinit var trxManager: TransactionManager

    private val mapper = ObjectMapper()

    @BeforeEach
    fun cleanup() {
        trxManager.run {
            repoEvidence.clear()
            repoUsers.clear()
            repoReport.clear()
        }
    }

    private fun createFile(): MockMultipartFile =
        MockMultipartFile(
            "file",
            "file.jpg",
            "image/jpeg",
            "dummyContent".toByteArray(),
        )

    @Test
    fun `create evidence success`() {
        val userId = createUser()
        val occurrenceId = createOccurrenceForUser(userId)
        val reportId = createReport(userId, occurrenceId)

        val input = createEvidenceInput(userId, reportId)
        val file = createFile()

        val resp = controller.createEvidence(file, input)

        assertEquals(HttpStatus.CREATED, resp.statusCode)
        assertNotNull(resp.headers.getFirst(HttpHeaders.LOCATION))
    }

    @Test
    fun `create evidence reporter not found`() {
        val userId = createUser()
        val occurrenceId = createOccurrenceForUser(userId)
        val reportId = createReport(userId, occurrenceId)

        val input = createEvidenceInput(999, reportId)
        val file = createFile()

        val resp = controller.createEvidence(file, input)

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `create evidence report not found`() {
        val userId = createUser()

        val input = createEvidenceInput(userId, 999)
        val file = createFile()

        val resp = controller.createEvidence(file, input)

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `find evidence by id success`() {
        val evidenceId = createEvidence()

        val resp = controller.findById(evidenceId)

        assertEquals(HttpStatus.OK, resp.statusCode)
        assertIs<Evidence>(resp.body)
    }

    @Test
    fun `find evidence by id not found`() {
        val resp = controller.findById(999)

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `find all evidence`() {
        createEvidence()
        createEvidence()

        val resp = controller.findAll()

        assertEquals(HttpStatus.OK, resp.statusCode)
        val list = resp.body as List<*>
        assertEquals(2, list.size)
    }

    @Test
    fun `find by report id`() {
        val userId = createUser()
        val occurrenceId = createOccurrenceForUser(userId)
        val reportId = createReport(userId, occurrenceId)

        createEvidence(userId, reportId)

        val resp = controller.findByReportId(reportId)

        val list = resp.body as List<*>
        assertEquals(1, list.size)
    }

    @Test
    fun `find by reporter id`() {
        val userId = createUser()
        val occurrenceId = createOccurrenceForUser(userId)
        val reportId = createReport(userId, occurrenceId)

        createEvidence(userId, reportId)

        val resp = controller.findByReporterId(userId)

        val list = resp.body as List<*>
        assertEquals(1, list.size)
    }

    @Test
    fun `find by location`() {
        val userId = createUser()

        val occurrenceId = createOccurrenceForUser(userId)
        val reportId = createReport(userId, occurrenceId)

        createEvidence(userId, reportId, location = "Lisbon")

        val resp = controller.findByLocation("Lisbon")

        val list = resp.body as List<*>
        assertEquals(1, list.size)
    }

    @Test
    fun `find by type`() {
        val userId = createUser()

        val occurrenceId = createOccurrenceForUser(userId)
        val reportId = createReport(userId, occurrenceId)

        val type = mapper.readTree("""{"t":"A"}""")

        createEvidence(userId, reportId, type = type)

        val resp = controller.findByType(type)

        val list = resp.body as List<*>
        assertEquals(1, list.size)
    }

    private fun createUser(): Int =
        trxManager.run {
            repoUsers.createUser(
                "user",
                "u@mail.com",
                PasswordValidationInfo("123"),
            ).id
        }

    private fun createReport(
        userId: Int,
        occurrence: Occurrence,
    ): Int =
        trxManager.run {
            repoReport.createReport(
                creatorId = userId,
                occurrenceId = occurrence.id,
                title = "title",
                description = "desc",
                type = occurrence.occurrenceType,
                addons = mapper.readTree("""{}"""),
                intervenors = occurrence.intervenors,
            ).id
        }

    private fun createOccurrenceForUser(userId: Int) =
        trxManager.run {
            repoOccurrence.createOccurrence(
                endDate = LocalDate.of(2030, 3, 30),
                reporterId = userId,
                importance = OccurrenceType.NORMAL,
                occurrenceType = mapper.readTree("""{"type":"base"}"""),
                occurrenceInfo = mapper.readTree("""{}"""),
            )
        }

    private fun createEvidence(
        userId: Int = createUser(),
        reportId: Int = createReport(userId, createOccurrenceForUser(userId)),
        location: String = "loc",
        type: JsonNode = mapper.readTree("""{"t":"x"}"""),
    ): Int {
        val file = createFile()
        return controller.createEvidence(
            file,
            createEvidenceInput(userId, reportId, location, type),
        ).let { resp ->
            val locationHeader = requireNotNull(resp.headers.getFirst(HttpHeaders.LOCATION))
            locationHeader.substringAfterLast("/").toInt()
        }
    }

    private fun createEvidenceInput(
        userId: Int,
        reportId: Int,
        location: String = "loc",
        type: JsonNode = mapper.readTree("""{"t":"x"}"""),
    ) = CreateEvidenceInput(
        type = type,
        location = location,
        description = "desc",
        reporterId = userId,
        reportId = reportId,
    )
}
