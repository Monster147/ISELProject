package pt.ira

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import pt.ira.interfaces.TransactionManager
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

@SpringJUnitConfig(TestConfig::class)
class RoleControllerTest {

    @Autowired
    private lateinit var controller: RoleController

    @Autowired
    private lateinit var trxManager: TransactionManager

    @BeforeEach
    fun cleanup() {
        trxManager.run {
            repoRole.clear()
        }
    }

    @Test
    fun `create role and find by name`() {
        val roleName = "admin"

        controller.createRole(roleName).let { resp ->
            assertEquals(HttpStatus.CREATED, resp.statusCode)

            val loc = resp.headers.getFirst(HttpHeaders.LOCATION)
            assertNotNull(loc)
            assertTrue(loc.startsWith("/api/role"))
        }

        controller.findByName(roleName).also { resp ->
            assertEquals(HttpStatus.OK, resp.statusCode)
            val role = resp.body as pt.ira.role.Role
            assertEquals(roleName, role.displayName)
        }
    }

    @Test
    fun `create duplicate role returns bad request`() {
        val roleName = "admin"

        controller.createRole(roleName)
        val resp = controller.createRole(roleName)

        assertEquals(HttpStatus.BAD_REQUEST, resp.statusCode)
    }

    @Test
    fun `delete role`() {
        val roleName = "admin"
        controller.createRole(roleName)

        val resp = controller.delete(roleName)

        assertEquals(HttpStatus.NO_CONTENT, resp.statusCode)

        val findResp = controller.findByName(roleName)
        assertEquals(HttpStatus.NOT_FOUND, findResp.statusCode)
    }

    @Test
    fun `delete non existing role returns 404`() {
        val resp = controller.delete("does-not-exist")

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `find by name not found`() {
        val resp = controller.findByName("nope")

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `find by id`() {
        val roleId = createRole("investigator")

        val resp = controller.findById(roleId)

        assertEquals(HttpStatus.OK, resp.statusCode)

        val role = resp.body as pt.ira.role.Role
        assertEquals(roleId, role.id)
    }

    @Test
    fun `find by id not found`() {
        val resp = controller.findById(999)

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `find all roles`() {
        createRole("admin")
        createRole("user")

        val resp = controller.findAll()

        assertEquals(HttpStatus.OK, resp.statusCode)

        val roles = resp.body as List<*>
        assertTrue(roles.size >= 2)
    }

    private fun createRole(name: String): Int =
        controller.createRole(name).let { resp ->
            val location = requireNotNull(
                resp.headers.getFirst(HttpHeaders.LOCATION)
            ) { "Missing Location header" }

            location.substringAfterLast("/").toInt()
        }

}