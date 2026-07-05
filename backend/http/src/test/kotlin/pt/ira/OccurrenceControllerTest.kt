package pt.ira

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import pt.ira.interfaces.TransactionManager
import pt.ira.model.occurrence.IntervenorIdInput
import pt.ira.model.occurrence.OccurrenceCreateInput
import pt.ira.occurrence.Occurrence
import pt.ira.occurrence.OccurrenceType
import pt.ira.user.AuthenticatedUser
import pt.ira.user.PasswordValidationInfo
import pt.ira.user.User
import java.time.LocalDate
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertIs
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

@SpringJUnitConfig(TestConfig::class)
class OccurrenceControllerTest {
    @Autowired
    private lateinit var controller: OccurrenceController

    @Autowired
    private lateinit var trxManager: TransactionManager

    @Autowired
    private lateinit var userServices: UserService

    private lateinit var user: User
    private lateinit var userToken: String
    private lateinit var userAuthenticatedUser: AuthenticatedUser

    private val mapper = ObjectMapper()

    private fun json(v: String) = mapper.readTree(v)

    private fun createType(): Int =
        trxManager.run {
            repoType.createType("type", json("""{"field": "value"}""")).id
        }

    @BeforeEach
    fun cleanup() {
        trxManager.run {
            repoOccurrence.clear()
            repoUsers.clear()
            repoIntervenor.clear()
            repoType.clear()
        }
        user =
            userServices.createUser("testUser", "testUser@mail.com", "Pass@123").let {
                check(it is Success)
                it.value
            }
        userToken =
            userServices.createToken("testUser@mail.com", "Pass@123").let {
                check(it is Success)
                it.value.tokenValue
            }
        userAuthenticatedUser = AuthenticatedUser(user, userToken)
    }

    @Test
    fun `create occurrence success`() {
        val userId = createUser()
        val typeId = createType()

        val input =
            OccurrenceCreateInput(
                usersId = userId,
                endDate = LocalDate.of(2030, 3, 30),
                importance = OccurrenceType.NORMAL,
                occurrenceType = typeId,
                occurrenceInfo = json("""{}"""),
            )

        val resp = controller.createOccurrence(input, userAuthenticatedUser)

        assertEquals(HttpStatus.CREATED, resp.statusCode)
        assertNotNull(resp.headers.getFirst(HttpHeaders.LOCATION))
    }

    @Test
    fun `create occurrence user not found returns 404`() {
        val typeId = createType()

        val input =
            OccurrenceCreateInput(
                usersId = 999,
                endDate = LocalDate.of(2030, 3, 30),
                importance = OccurrenceType.NORMAL,
                occurrenceType = typeId,
                occurrenceInfo = json("""{}"""),
            )

        val resp = controller.createOccurrence(input, userAuthenticatedUser)

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `create occurrence past date returns bad request`() {
        val userId = createUser()
        val typeId = createType()

        val input =
            OccurrenceCreateInput(
                usersId = userId,
                endDate = LocalDate.now().minusDays(1),
                importance = OccurrenceType.NORMAL,
                occurrenceType = typeId,
                occurrenceInfo = json("""{}"""),
            )

        val resp = controller.createOccurrence(input, userAuthenticatedUser)

        assertEquals(HttpStatus.BAD_REQUEST, resp.statusCode)
    }

    @Test
    fun `find occurrence by id success`() {
        val occurrenceId = createOccurrence()

        val resp = controller.findById(occurrenceId, userAuthenticatedUser)

        assertEquals(HttpStatus.OK, resp.statusCode)
        assertIs<Occurrence>(resp.body)
    }

    @Test
    fun `find occurrence by id not found`() {
        val resp = controller.findById(999, userAuthenticatedUser)

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `add intervenor success`() {
        val occurrenceId = createOccurrence()
        val intervenorId = createIntervenor()

        val resp = controller.addIntervenor(occurrenceId, IntervenorIdInput(intervenorId), userAuthenticatedUser)

        assertEquals(HttpStatus.OK, resp.statusCode)

        val body = resp.body as Occurrence
        assertTrue(body.intervenors.contains(intervenorId))
    }

    @Test
    fun `add intervenor report not found`() {
        val intervenorId = createIntervenor()

        val resp = controller.addIntervenor(999, IntervenorIdInput(intervenorId), userAuthenticatedUser)

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `add intervenor not found`() {
        val occurrenceId = createOccurrence()

        val resp = controller.addIntervenor(occurrenceId, IntervenorIdInput(999), userAuthenticatedUser)

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `remove intervenor success`() {
        val occurrenceId = createOccurrence()
        val intervenorId = createIntervenor()

        controller.addIntervenor(occurrenceId, IntervenorIdInput(intervenorId), userAuthenticatedUser)

        val resp = controller.removeIntervenor(occurrenceId, IntervenorIdInput(intervenorId), userAuthenticatedUser)

        assertEquals(HttpStatus.OK, resp.statusCode)

        val body = resp.body as Occurrence
        assertFalse(body.intervenors.contains(intervenorId))
    }

    @Test
    fun `find all occurrences`() {
        createOccurrence()
        createOccurrence()

        val resp = controller.findAll(userAuthenticatedUser)

        assertEquals(HttpStatus.OK, resp.statusCode)

        val either = resp.body as Either<*, *>
        val list = (either as Either.Right).value as List<*>
        assertEquals(2, list.size)
    }

    @Test
    fun `find by importance`() {
        val userId = createUser()
        val typeId = createType()

        trxManager.run {
            repoOccurrence.createOccurrence(
                endDate = LocalDate.of(2030, 3, 30),
                reporterId = userId,
                importance = OccurrenceType.CRITICAL,
                occurrenceType = typeId,
                occurrenceInfo = json("""{}"""),
            )
        }

        val resp = controller.findByImportance("CRITICAL", userAuthenticatedUser)

        assertEquals(HttpStatus.OK, resp.statusCode)
        assertEquals(1, resp.body.size)
        assertEquals(OccurrenceType.CRITICAL, resp.body[0].importance)
    }

    @Test
    fun `find by reporter id`() {
        val userId = createUser()
        val typeId = createType()

        trxManager.run {
            repoOccurrence.createOccurrence(
                endDate = LocalDate.of(2030, 3, 30),
                reporterId = userId,
                importance = OccurrenceType.NORMAL,
                occurrenceType = typeId,
                occurrenceInfo = json("""{}"""),
            )
        }

        val resp = controller.findByReporterId(userId, userAuthenticatedUser)

        assertEquals(HttpStatus.OK, resp.statusCode)
        assertEquals(1, resp.body.size)
        assertEquals(userId, resp.body[0].reporterId)
    }

    @Test
    fun `delete occurrence success returns 204`() {
        val occurrenceId = createOccurrence()

        val resp = controller.deleteById(occurrenceId, userAuthenticatedUser)

        assertEquals(HttpStatus.NO_CONTENT, resp.statusCode)

        val find = controller.findById(occurrenceId, userAuthenticatedUser)
        assertEquals(HttpStatus.NOT_FOUND, find.statusCode)
    }

    @Test
    fun `delete occurrence not found returns 404`() {
        val resp = controller.deleteById(999, userAuthenticatedUser)

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    private fun createUser(): Int =
        trxManager.run {
            repoUsers.createUser(
                "user",
                "u@mail.com",
                PasswordValidationInfo("123"),
            ).id
        }

    private fun createOccurrence(userId: Int = createUser()): Int =
        controller.createOccurrence(
            OccurrenceCreateInput(
                usersId = userId,
                endDate = LocalDate.of(2030, 3, 30),
                importance = OccurrenceType.NORMAL,
                occurrenceType = createType(),
                occurrenceInfo = json("""{}"""),
            ),
            userAuthenticatedUser,
        ).let { resp ->
            val location =
                requireNotNull(resp.headers.getFirst(HttpHeaders.LOCATION))
            location.substringAfterLast("/").toInt()
        }

    private fun createIntervenor(): Int =
        trxManager.run {
            repoIntervenor.createIntervenor(
                "123",
                "CC",
                "name",
                "contact",
                "addr",
            ).id
        }
}
