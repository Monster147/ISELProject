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
            repoOccurrence.clear()
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

        val input = createEvidenceInput(userId, occurrenceId)
        val file = createFile()

        val resp = controller.createEvidence(file, input)

        assertEquals(HttpStatus.CREATED, resp.statusCode)
        assertNotNull(resp.headers.getFirst(HttpHeaders.LOCATION))
    }

    @Test
    fun `create evidence reporter not found`() {
        val userId = createUser()
        val occurrenceId = createOccurrenceForUser(userId)

        val input = createEvidenceInput(999, occurrenceId)
        val file = createFile()

        val resp = controller.createEvidence(file, input)

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `create evidence occurrence not found`() {
        val userId = createUser()

        val input = createEvidenceInput(userId, 999)
        val file = createFile()

        val resp = controller.createEvidence(file, input)

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `find evidence by id success`() {
        val userId = createUser()
        val occurrenceId = createOccurrenceForUser(userId)
        val evidenceId = createEvidence(userId, occurrenceId)

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
        val userId = createUser()
        val occurrenceId = createOccurrenceForUser(userId)
        createEvidence(userId, occurrenceId)
        createEvidence(userId, occurrenceId)

        val resp = controller.findAll()

        assertEquals(HttpStatus.OK, resp.statusCode)
        val list = resp.body as List<*>
        assertEquals(2, list.size)
    }

    @Test
    fun `find by occurrence id`() {
        val userId = createUser()
        val occurrenceId = createOccurrenceForUser(userId)

        createEvidence(userId, occurrenceId)

        val resp = controller.findByOccurrenceId(occurrenceId)

        val list = resp.body as List<*>
        assertEquals(1, list.size)
    }

    @Test
    fun `find by reporter id`() {
        val userId = createUser()
        val occurrenceId = createOccurrenceForUser(userId)

        createEvidence(userId, occurrenceId)

        val resp = controller.findByReporterId(userId)

        val list = resp.body as List<*>
        assertEquals(1, list.size)
    }

    @Test
    fun `find by location`() {
        val userId = createUser()

        val occurrenceId = createOccurrenceForUser(userId)

        createEvidence(userId, occurrenceId, location = "Lisbon")

        val resp = controller.findByLocation("Lisbon")

        val list = resp.body as List<*>
        assertEquals(1, list.size)
    }

    @Test
    fun `find by type`() {
        val userId = createUser()

        val occurrenceId = createOccurrenceForUser(userId)

        val type = mapper.readTree("""{"t":"A"}""")

        createEvidence(userId, occurrenceId, type = type)

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

    private fun createOccurrenceForUser(userId: Int) =
        trxManager.run {
            repoOccurrence.createOccurrence(
                endDate = LocalDate.of(2030, 3, 30),
                reporterId = userId,
                importance = OccurrenceType.NORMAL,
                occurrenceType = 1,
                occurrenceInfo = mapper.readTree("""{}"""),
            ).id
        }

    private fun createEvidence(
        userId: Int,
        occurrenceId: Int,
        location: String = "loc",
        type: JsonNode = mapper.readTree("""{"t":"x"}"""),
    ): Int {
        val file = createFile()
        return controller.createEvidence(
            file,
            createEvidenceInput(userId, occurrenceId, location, type),
        ).let { resp ->
            val locationHeader = requireNotNull(resp.headers.getFirst(HttpHeaders.LOCATION))
            locationHeader.substringAfterLast("/").toInt()
        }
    }

    private fun createEvidenceInput(
        userId: Int,
        occurrenceId: Int,
        location: String = "loc",
        type: JsonNode = mapper.readTree("""{"t":"x"}"""),
    ) = CreateEvidenceInput(
        type = type,
        location = location,
        description = "desc",
        reporterId = userId,
        occurrenceId = occurrenceId,
    )
}
