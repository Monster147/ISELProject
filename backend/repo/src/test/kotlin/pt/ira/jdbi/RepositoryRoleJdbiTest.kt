package pt.ira.jdbi

import org.jdbi.v3.core.Jdbi
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.postgresql.ds.PGSimpleDataSource
import pt.ira.role.Role
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class RepositoryRoleJdbiTest {
    companion object {
        private val jdbi: Jdbi =
            Jdbi
                .create(
                    PGSimpleDataSource().apply {
                        val url = Environment.getDbUrl()
                        setURL(url)
                    },
                ).configureWithAppRequirements()

        private val trxManager = TransactionManagerJdbi(jdbi)
    }

    @BeforeEach
    fun setup() {
        trxManager.run {
            jdbi.useHandle<Exception> {
                it.createUpdate("TRUNCATE TABLE dbo.roles RESTART IDENTITY CASCADE")
                    .execute()
            }
            repoRole.createRole("admin")
            repoRole.createRole("investigator")
            repoRole.createRole("supervisor")
        }
    }

    @Test
    fun `findAll returns seeded roles`() {
        trxManager.run {
            val roles = repoRole.findAll()
            assertEquals(3, roles.size)
            assertEquals(listOf("admin", "investigator", "supervisor"), roles.map { it.displayName })
            assertEquals(listOf(1, 2, 3), roles.map { it.id })
        }
    }

    @Test
    fun `findById returns role when it exists and null otherwise`() {
        trxManager.run {
            val admin = repoRole.findById(1)
            assertNotNull(admin)
            assertEquals(Role(1, "admin"), admin)

            assertNull(repoRole.findById(999))
        }
    }

    @Test
    fun `createRole adds a new role with next id`() {
        trxManager.run {
            val created = repoRole.createRole("gestor")

            assertEquals(4, created.id)
            assertEquals("gestor", created.displayName)

            val all = repoRole.findAll()
            assertEquals(4, all.size)
            assertEquals(created, repoRole.findById(4))
        }
    }

    @Test
    fun `deleteRoleByName removes role`() {
        trxManager.run {
            repoRole.deleteRoleByName("investigator")

            val all = repoRole.findAll()
            assertEquals(2, all.size)
            assertNull(repoRole.findById(2))
            assertEquals(listOf("admin", "supervisor"), all.map { it.displayName })
        }
    }

    @Test
    fun `save replaces role with same id`() {
        trxManager.run {
            val original = repoRole.findById(3)
            assertNotNull(original)
            assertEquals("supervisor", original.displayName)

            repoRole.save(Role(3, "manager"))

            val updated = repoRole.findById(3)
            assertNotNull(updated)
            assertEquals(Role(3, "manager"), updated)

            val all = repoRole.findAll()
            assertEquals(3, all.size)
            assertEquals(1, all.count { it.id == 3 })
        }
    }

    @Test
    fun `deleteById removes role`() {
        trxManager.run {
            repoRole.deleteById(1)
            assertNull(repoRole.findById(1))
            assertEquals(2, repoRole.findAll().size)
        }
    }

    @Test
    fun `clear removes all roles`() {
        trxManager.run {
            repoRole.clear()
            assertTrue(repoRole.findAll().isEmpty())
            assertNull(repoRole.findById(1))
        }
    }
}
