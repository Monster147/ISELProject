package pt.ira.mem

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import pt.ira.interfaces.RepositoryType
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class RepositoryTypeMemTest {
    private lateinit var repo: RepositoryType
    private val mapper = ObjectMapper()

    private fun json(str: String) = mapper.readTree(str)

    @BeforeEach
    fun setup() {
        repo = RepositoryTypeMem()
    }

    @Test
    fun `createType and findById`() {
        val type = repo.createType("Fire", json("""{"field":"value"}"""))

        val found = repo.findById(type.id)

        assertEquals(type, found)
    }

    @Test
    fun `findByName returns correct type`() {
        val type = repo.createType("Accident", json("""{}"""))

        val found = repo.findByName("Accident")

        assertEquals(type, found)
    }

    @Test
    fun `findAll returns all types`() {
        val t1 = repo.createType("A", json("""{}"""))
        val t2 = repo.createType("B", json("""{}"""))

        val all = repo.findAll()

        assertEquals(listOf(t1, t2), all)
    }

    @Test
    fun `deleteById removes type`() {
        val type = repo.createType("X", json("""{}"""))

        repo.deleteById(type.id)

        assertNull(repo.findById(type.id))
    }

    @Test
    fun `save updates existing type`() {
        val type = repo.createType("Old", json("""{"a":1}"""))

        val updated = type.copy(name = "New")

        repo.save(updated)

        val found = repo.findById(type.id)

        assertNotNull(found)
        assertEquals("New", found.name)
    }

    @Test
    fun `clear removes all types`() {
        repo.createType("A", json("""{}"""))
        repo.createType("B", json("""{}"""))

        repo.clear()

        assertTrue(repo.findAll().isEmpty())
    }
}
