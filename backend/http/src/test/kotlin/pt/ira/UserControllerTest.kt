package pt.ira

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import pt.ira.mem.TransactionManagerInMem
import pt.ira.model.role.RoleInput
import pt.ira.model.role.RolesInput
import pt.ira.model.user.UserCreateTokenInputModel
import pt.ira.model.user.UserCreateTokenOutputModel
import pt.ira.model.user.UserHomeOutputModel
import pt.ira.model.user.UserInput
import pt.ira.report.ReportTypePercentage
import pt.ira.user.AuthenticatedUser
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

@SpringJUnitConfig(TestConfig::class)
class UserControllerTest{

    @Autowired
    private lateinit var controllerUser: UserController

    @Autowired
    private lateinit var trxManager: TransactionManagerInMem

    @BeforeEach
    fun cleanup(){
        trxManager.run{
            repoUsers.clear()
        }
    }

    @Test
    fun `create user + token + find by id`() {
        val name = "John Wick"
        val email = "john@wick.com"
        val password = "babaYaga"

        // create user
        val userId = controllerUser.createUser(UserInput(name, email, password)).let { resp ->
            assertEquals(HttpStatus.CREATED, resp.statusCode)

            val location = resp.headers.getFirst(HttpHeaders.LOCATION)
            assertNotNull(location)
            assertTrue(location.startsWith("/api/user"))

            location.split("/").last().toInt()
        }

        // create token
        val token = controllerUser.token(UserCreateTokenInputModel(email, password)).let { resp ->
            assertEquals(HttpStatus.CREATED, resp.statusCode)
            assertIs<UserCreateTokenOutputModel>(resp.body)

            (resp.body as UserCreateTokenOutputModel).token
        }

        // find user by id
        controllerUser.findUserById(userId).also { resp ->
            assertEquals(HttpStatus.OK, resp.statusCode)
            assertEquals(
                 UserHomeOutputModel(userId, name, email),
                resp.body
            )
        }
    }

    @Test
    fun `create user with duplicate email returns bad request`() {
        val input = UserInput("A", "a@mail.com", "123456")

        controllerUser.createUser(input)
        val resp = controllerUser.createUser(input)

        assertEquals(HttpStatus.BAD_REQUEST, resp.statusCode)
    }

    @Test
    fun `create user with insecure password returns bad request`() {
        val resp = controllerUser.createUser(
            UserInput("John", "john@mail.com", "123") // weak password
        )

        assertEquals(HttpStatus.BAD_REQUEST, resp.statusCode)
    }

    @Test
    fun `token with wrong credentials returns bad request`() {
        controllerUser.createUser(UserInput("A", "a@mail.com", "123456"))

        val resp = controllerUser.token(
            UserCreateTokenInputModel("a@mail.com", "wrong")
        )

        assertEquals(HttpStatus.BAD_REQUEST, resp.statusCode)
    }

    @Test
    fun `find user that does not exist returns 404`() {
        val resp = controllerUser.findUserById(999)

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `add role to user`() {
        val userId = controllerUser.createUser(UserInput("A", "a@mail.com", "123456")).let { resp ->
            assertEquals(HttpStatus.CREATED, resp.statusCode)

            val location = resp.headers.getFirst(HttpHeaders.LOCATION)
            assertNotNull(location)
            assertTrue(location.startsWith("/api/user"))

            location.split("/").last().toInt()
        }

        val roleId = 1 // Already have roles in memory repo, so we can use one of them

        val resp = controllerUser.addRole(RoleInput(roleId, userId))

        assertEquals(HttpStatus.OK, resp.statusCode)
    }

    @Test
    fun `remove role from user`() {
        val userId = controllerUser.createUser(UserInput("A", "a@mail.com", "123456")).let { resp ->
            assertEquals(HttpStatus.CREATED, resp.statusCode)

            val location = resp.headers.getFirst(HttpHeaders.LOCATION)
            assertNotNull(location)
            assertTrue(location.startsWith("/api/user"))

            location.split("/").last().toInt()
        }

        val roleId = 1 // Already have roles in memory repo, so we can use one of them

        val respAddRole = controllerUser.addRole(RoleInput(roleId, userId))
        assertEquals(HttpStatus.OK, respAddRole.statusCode)

        val respRemoveRole = controllerUser.removeRole(RoleInput(roleId, userId))
        assertEquals(HttpStatus.OK, respRemoveRole.statusCode)
    }

    @Test
    fun `remove role that does not exist returns 404`() {
        val userId = controllerUser.createUser(UserInput("A", "a@mail.com", "123456"))
            .headers.getFirst(HttpHeaders.LOCATION)!!
            .split("/").last().toInt()

        val resp = controllerUser.removeRole(RoleInput(roleId = 999, userId = userId))

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `set roles for user`() {
        val userId = controllerUser.createUser(UserInput("A", "a@mail.com", "123456")).let { resp ->
            assertEquals(HttpStatus.CREATED, resp.statusCode)

            val location = resp.headers.getFirst(HttpHeaders.LOCATION)
            assertNotNull(location)
            assertTrue(location.startsWith("/api/user"))

            location.split("/").last().toInt()
        }

        val rolesIds = listOf(1, 2) // Already have roles in memory repo, so we can use one of them

        val resp = controllerUser.setRoles(RolesInput(rolesIds, userId))

        assertEquals(HttpStatus.OK, resp.statusCode)
    }

    @Test
    fun `add role with invalid role returns 404`() {
        val userId = controllerUser.createUser(UserInput("A", "a@mail.com", "123456")).let { resp ->
            assertEquals(HttpStatus.CREATED, resp.statusCode)

            val location = resp.headers.getFirst(HttpHeaders.LOCATION)
            assertNotNull(location)
            assertTrue(location.startsWith("/api/user"))

            location.split("/").last().toInt()
        }

        val roleId = 999 // Invalid role id

        val resp = controllerUser.addRole(RoleInput(roleId, userId))

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `add role to non existing user returns 404`() {
        val resp = controllerUser.addRole(RoleInput(roleId = 1, userId = 999))

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `find users by role`() {
        val userId = controllerUser.createUser(UserInput("A", "a@mail.com", "123456")).let { resp ->
            assertEquals(HttpStatus.CREATED, resp.statusCode)

            val location = resp.headers.getFirst(HttpHeaders.LOCATION)
            assertNotNull(location)
            assertTrue(location.startsWith("/api/user"))

            location.split("/").last().toInt()
        }

        val roleId = 1
        controllerUser.addRole(RoleInput(roleId, userId))

        val resp = controllerUser.findUsersByRole(roleId)

        assertEquals(HttpStatus.OK, resp.statusCode)
        val body = resp.body as List<*>

        println(body)
        assertEquals(1, body.size)
    }

    @Test
    fun `get report type percentages for user`() {
        val userId = controllerUser.createUser(UserInput("A", "a@mail.com", "123456"))
            .headers.getFirst(HttpHeaders.LOCATION)!!
            .split("/").last().toInt()

        val resp = controllerUser.getPercentages(userId)

        assertEquals(HttpStatus.OK, resp.statusCode)
        assertIs<List<ReportTypePercentage>>(resp.body)
    }
}
