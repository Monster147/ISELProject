package pt.ira

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertTrue

@SpringJUnitConfig(TestConfig::class)
class RoleServiceTest {
    @Autowired
    private lateinit var roleService: RoleService

    @Test
    fun `createRole creates new role`() {
        val result = roleService.createRole("analyst")

        val role =
            result.let {
                check(it is Success)
                it.value
            }

        assertEquals("analyst", role.displayName)
    }

    @Test
    fun `createRole fails if role already exists`() {
        val result = roleService.createRole("admin") // já existe no seed

        assertIs<Either.Left<*>>(result)
        assertIs<RoleError.RoleAlreadyExists>(result.value)
    }

    @Test
    fun `findByName returns role`() {
        val role =
            roleService.findByName("admin").let {
                check(it is Success)
                it.value
            }

        assertEquals("admin", role.displayName)
    }

    @Test
    fun `findByName fails if not found`() {
        val result = roleService.findByName("nonexistent")

        assertIs<Either.Left<*>>(result)
        assertIs<RoleError.RoleNotFound>(result.value)
    }

    @Test
    fun `findById returns role`() {
        val role =
            roleService.findById(1).let {
                check(it is Success)
                it.value
            }

        assertEquals(1, role.id)
    }

    @Test
    fun `findById fails if not found`() {
        val result = roleService.findById(999)

        assertIs<Either.Left<*>>(result)
        assertIs<RoleError.RoleNotFound>(result.value)
    }

    @Test
    fun `findAllRoles returns all roles`() {
        val roles = roleService.findAllRoles()

        assertTrue(roles.isNotEmpty())
        assertTrue(roles.any { it.displayName == "admin" })
    }

    @Test
    fun `deleteRoleByName removes role`() {
        roleService.createRole("temp-role")

        val result = roleService.deleteRoleByName("temp-role")

        assertIs<Success<Unit>>(result)

        val findResult = roleService.findByName("temp-role")
        assertIs<Either.Left<*>>(findResult)
        assertIs<RoleError.RoleNotFound>(findResult.value)
    }

    @Test
    fun `deleteRoleByName fails if role does not exist`() {
        val result = roleService.deleteRoleByName("does-not-exist")

        assertIs<Either.Left<*>>(result)
        assertIs<RoleError.RoleNotFound>(result.value)
    }
}
