package pt.ira.jdbi

import com.fasterxml.jackson.databind.ObjectMapper
import org.jdbi.v3.core.Jdbi
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.postgresql.ds.PGSimpleDataSource
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull

class RepositoryTypeJdbiTest {
    companion object {
        private val jdbi: Jdbi =
            Jdbi.create(
                PGSimpleDataSource().apply {
                    setURL(Environment.getDbUrl())
                },
            ).configureWithAppRequirements()

        private val trxManager = TransactionManagerJdbi(jdbi)
    }

    private val mapper = ObjectMapper()

    private fun json(str: String) = mapper.readTree(str)

    @BeforeEach
    fun setup() {
        trxManager.run {
            repoType.clear()
        }
    }

    @Test
    fun `createType and findById`() {
        trxManager.run {
            val type = repoType.createType("Fire", json("""{"f":"v"}"""))

            val found = repoType.findById(type.id)

            assertNotNull(found)
            assertEquals(type, found)
        }
    }

    @Test
    fun `findByName returns correct type`() {
        trxManager.run {
            val type = repoType.createType("Accident", json("""{}"""))

            val found = repoType.findByName("Accident")

            assertNotNull(found)
            assertEquals(type, found)
        }
    }

    @Test
    fun `findAll returns all types`() {
        trxManager.run {
            val t1 = repoType.createType("A", json("""{}"""))
            val t2 = repoType.createType("B", json("""{}"""))

            val all = repoType.findAll()

            assertEquals(listOf(t1, t2), all)
        }
    }

    @Test
    fun `deleteById removes type`() {
        trxManager.run {
            val type = repoType.createType("X", json("""{}"""))

            repoType.deleteById(type.id)

            assertNull(repoType.findById(type.id))
        }
    }

    @Test
    fun `save updates existing type`() {
        trxManager.run {
            val type = repoType.createType("Old", json("""{"a":1}"""))

            val updated = type.copy(name = "New")

            repoType.save(updated)

            val found = repoType.findById(type.id)

            assertNotNull(found)
            assertEquals("New", found.name)
        }
    }

    @Test
    fun `clear removes all types`() {
        trxManager.run {
            repoType.createType("A", json("""{}"""))
            repoType.createType("B", json("""{}"""))

            repoType.clear()

            assertTrue(repoType.findAll().isEmpty())
        }
    }
}