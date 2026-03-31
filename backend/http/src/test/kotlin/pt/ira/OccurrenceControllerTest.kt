package pt.ira

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import pt.ira.interfaces.TransactionManager
import pt.ira.model.occurrence.OccurrenceCreateInput
import pt.ira.occurrence.Occurrence
import pt.ira.occurrence.OccurrenceType
import pt.ira.user.PasswordValidationInfo
import java.time.LocalDate
import kotlin.test.*

@SpringJUnitConfig(TestConfig::class)
class OccurrenceControllerTest {

    @Autowired
    private lateinit var controller: OccurrenceController

    @Autowired
    private lateinit var trxManager: TransactionManager

    @BeforeEach
    fun cleanup() {
        trxManager.run {
            repoOccurrence.clear()
            repoUsers.clear()
        }
    }

    @Test
    fun `create occurrence success`() {
        val userId = createUser()

        val input =
            OccurrenceCreateInput(
                usersId = listOf(userId),
                endDate = LocalDate.of(2030, 3, 30),
                importance = OccurrenceType.NORMAL
            )

        val resp = controller.createOccurrence(input)

        assertEquals(HttpStatus.CREATED, resp.statusCode)
        assertNotNull(resp.headers.getFirst(HttpHeaders.LOCATION))
    }

    @Test
    fun `create occurrence user not found returns 404`() {
        val input =
            OccurrenceCreateInput(
                usersId = listOf(999),
                endDate = LocalDate.of(2030, 3, 30),
                importance = OccurrenceType.NORMAL
            )

        val resp = controller.createOccurrence(input)

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `create occurrence past date returns bad request`() {
        val userId = createUser()

        val input =
            OccurrenceCreateInput(
                usersId = listOf(userId),
                endDate = LocalDate.now().minusDays(1),
                importance = OccurrenceType.NORMAL
            )

        val resp = controller.createOccurrence(input)

        assertEquals(HttpStatus.BAD_REQUEST, resp.statusCode)
    }

    @Test
    fun `create occurrence duplicate users returns bad request`() {
        val userId = createUser()

        val input =
            OccurrenceCreateInput(
                usersId = listOf(userId, userId),
                endDate = LocalDate.of(2030, 3, 30),
                importance = OccurrenceType.NORMAL
            )

        val resp = controller.createOccurrence(input)

        assertEquals(HttpStatus.BAD_REQUEST, resp.statusCode)
    }

    @Test
    fun `find occurrence by id success`() {
        val occurrenceId = createOccurrence()

        val resp = controller.findById(occurrenceId)

        assertEquals(HttpStatus.OK, resp.statusCode)
        assertIs<Occurrence>(resp.body)
    }

    @Test
    fun `find occurrence by id not found`() {
        val resp = controller.findById(999)

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `find all occurrences`() {
        createOccurrence()
        createOccurrence()

        val resp = controller.findAll()

        assertEquals(HttpStatus.OK, resp.statusCode)

        val list = resp.body as List<*>
        assertEquals(2, list.size)
    }

    @Test
    fun `find by importance`() {
        val userId = createUser()

        trxManager.run {
            repoOccurrence.createOccurrence(
                endDate = LocalDate.of(2030, 3, 30),
                reporterId = listOf(userId),
                importance = OccurrenceType.CRITICAL
            )
        }

        val resp = controller.findByImportance("CRITICAL")

        assertEquals(HttpStatus.OK, resp.statusCode)
        assertEquals(1, resp.body.size)
        assertEquals(OccurrenceType.CRITICAL, resp.body[0].importance)
    }

    @Test
    fun `find by reporter id`() {
        val userId = createUser()

        trxManager.run {
            repoOccurrence.createOccurrence(
                endDate = LocalDate.of(2030, 3, 30),
                reporterId = listOf(userId),
                importance = OccurrenceType.NORMAL
            )
        }

        val resp = controller.findByReporterId(userId)

        assertEquals(HttpStatus.OK, resp.statusCode)
        assertEquals(1, resp.body.size)
        assertEquals(userId, resp.body[0].reporterId.first())
    }

    @Test
    fun `delete occurrence success returns 204`() {
        val occurrenceId = createOccurrence()

        val resp = controller.deleteById(occurrenceId)

        assertEquals(HttpStatus.NO_CONTENT, resp.statusCode)

        val find = controller.findById(occurrenceId)
        assertEquals(HttpStatus.NOT_FOUND, find.statusCode)
    }

    @Test
    fun `delete occurrence not found returns 404`() {
        val resp = controller.deleteById(999)

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }


    private fun createUser(): Int =
        trxManager.run {
            repoUsers.createUser(
                "user",
                "u@mail.com",
                PasswordValidationInfo("123")
            ).id
        }

    private fun createOccurrence(
        userId: Int = createUser()
    ): Int =
        controller.createOccurrence(
            OccurrenceCreateInput(
                usersId = listOf(userId),
                endDate = LocalDate.of(2030, 3, 30),
                importance = OccurrenceType.NORMAL
            )
        ).let { resp ->
            val location =
                requireNotNull(resp.headers.getFirst(HttpHeaders.LOCATION))
            location.substringAfterLast("/").toInt()
        }
}