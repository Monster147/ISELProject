package pt.ira.mem

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import pt.ira.role.Role
import pt.ira.interfaces.RepositoryRole
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class RepositoryRoleMemTest {
    private lateinit var repo: RepositoryRole

    @BeforeEach
    fun setup() {
        repo = RepositoryRoleMem()
    }

    @Test
    fun `findAll returns seeded roles`() {
        val roles = repo.findAll()
        assertEquals(3, roles.size)
        assertEquals(listOf("admin", "investigator", "supervisor"), roles.map { it.displayName })
        assertEquals(listOf(1, 2, 3), roles.map { it.id })
    }

    @Test
    fun `findById returns role when it exists and null otherwise`() {
        val admin = repo.findById(1)
        assertNotNull(admin)
        assertEquals(Role(1, "admin"), admin)

        assertNull(repo.findById(999))
    }

    @Test
    fun `createRole adds a new role with next id`() {
        val created = repo.createRole("gestor")

        assertEquals(4, created.id)
        assertEquals("gestor", created.displayName)

        val all = repo.findAll()
        assertEquals(4, all.size)
        assertEquals(created, repo.findById(4))
    }

    @Test
    fun `deleteRoleByName removes role`() {
        repo.deleteRoleByName("investigator")

        val all = repo.findAll()
        assertEquals(2, all.size)
        assertNull(repo.findById(2))
        assertEquals(listOf("admin", "supervisor"), all.map { it.displayName })
    }

    @Test
    fun `save replaces role with same id`() {
        val original = repo.findById(3)
        assertNotNull(original)
        assertEquals("supervisor", original.displayName)

        repo.save(Role(3, "manager"))

        val updated = repo.findById(3)
        assertNotNull(updated)
        assertEquals(Role(3, "manager"), updated)

        val all = repo.findAll()
        assertEquals(3, all.size)
        assertEquals(1, all.count { it.id == 3 })
    }

    @Test
    fun `deleteById removes role`() {
        repo.deleteById(1)
        assertNull(repo.findById(1))
        assertEquals(2, repo.findAll().size)
    }

    @Test
    fun `clear removes all roles`() {
        repo.clear()
        assertTrue(repo.findAll().isEmpty())
        assertNull(repo.findById(1))
    }
}
