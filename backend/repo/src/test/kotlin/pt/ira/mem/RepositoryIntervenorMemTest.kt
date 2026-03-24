package pt.ira.mem

import pt.ira.interfaces.RepositoryIntervenor
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import pt.ira.Intervenor
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class RepositoryIntervenorMemTest {

    private lateinit var repo: RepositoryIntervenor

    @BeforeEach
    fun setup() {
        repo = RepositoryIntervenorMem()
    }

    @Test
    fun `createIntervenor and findById`() {
        val report = repo.createIntervenor(
            "ID123",
            "passport",
            "Alice",
            "alice@mail.com",
            "Street 1"
        )

        val found = repo.findById(report.id)

        assertEquals(report, found)
    }

    @Test
    fun `findAll returns all intervenors`() {
        val i1 = repo.createIntervenor("ID123", "passport", "Alice", "alice@mail.com", "Street 1")
        val i2 = repo.createIntervenor("ID456", "idCard", "Bob", "bob@mail.com", "Street 2")

        val all = repo.findAll()
        assertEquals(listOf(i1, i2), all)
    }

    @Test
    fun `deleteById removes intervenor`() {
        val intervenor = repo.createIntervenor("ID123", "passport", "Alice", "alice@mail.com", "Street 1")

        repo.deleteById(intervenor.id)
        val found = repo.findById(intervenor.id)

        assertNull(found)
    }

    @Test
    fun `clear removes all intervenors`() {
        repo.createIntervenor("ID123", "passport", "Alice", "alice@mail.com", "Street 1")
        repo.createIntervenor("ID456", "idCard", "Bob", "bob@mail.com", "Street 2")

        repo.clear()
        assertTrue(repo.findAll().isEmpty())
    }

    @Test
    fun `findByIdNumber returns correct intervenor`() {
        val i1 = repo.createIntervenor("ID123", "passport", "Alice", "alice@mail.com", "Street 1")

        val found = repo.findByIdNumber("ID123")
        assertEquals(i1, found)
        val notFound = repo.findByIdNumber("ID999")
        assertNull(notFound)
    }

    @Test
    fun `findByContactInfo returns correct intervenor`() {
        val i1 = repo.createIntervenor("ID123", "passport", "Alice", "alice@mail.com", "Street 1")

        val found = repo.findByContactInfo("alice@mail.com")
        assertEquals(i1, found)
        val notFound = repo.findByContactInfo("unknown@mail.com")
        assertNull(notFound)
    }

    @Test
    fun `save replaces existing intervenor with same id`() {
        val intervenor = repo.createIntervenor("ID123", "passport", "Alice", "alice@mail.com", "Street 1")

        val updatedIntervenor = intervenor.copy(name = "Alice Updated")
        repo.save(updatedIntervenor)

        val found = repo.findById(1)
        assertNotNull(found)
        assertEquals(updatedIntervenor, found)
        assertEquals("Alice Updated", found.name)
    }
}