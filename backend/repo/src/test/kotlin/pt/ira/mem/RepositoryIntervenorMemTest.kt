package pt.ira.mem

import pt.ira.interfaces.RepositoryIntervenor
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import pt.ira.Intervenor
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

class RepositoryIntervenorMemTest {

    private lateinit var repo: RepositoryIntervenor

    @BeforeEach
    fun setup() {
        repo = RepositoryIntervenorMem()
    }

    @Test
    fun `save and findById returns correct intervenor`() {
        val intervenor = Intervenor(1, "ID123", "passport", "Alice", "alice@mail.com", "Street 1")
        repo.save(intervenor)

        val found = repo.findById(1)
        assertEquals(intervenor, found)
    }

    @Test
    fun `findAll returns all intervenors`() {
        val i1 = Intervenor(1, "ID123", "passport", "Alice", "alice@mail.com", "Street 1")
        val i2 = Intervenor(2, "ID456", "idCard", "Bob", "bob@mail.com", "Street 2")
        repo.save(i1)
        repo.save(i2)

        val all = repo.findAll()
        assertEquals(listOf(i1, i2), all)
    }

    @Test
    fun `deleteById removes intervenor`() {
        val intervenor = Intervenor(1, "ID123", "passport", "Alice", "alice@mail.com", "Street 1")
        repo.save(intervenor)

        repo.deleteById(1)
        val found = repo.findById(1)

        assertNull(found)
    }

    @Test
    fun `clear removes all intervenors`() {
        val i1 = Intervenor(1, "ID123", "passport", "Alice", "alice@mail.com", "Street 1")
        val i2 = Intervenor(2, "ID456", "idCard", "Bob", "bob@mail.com", "Street 2")
        repo.save(i1)
        repo.save(i2)

        repo.clear()
        assertTrue(repo.findAll().isEmpty())
    }

    @Test
    fun `findByIdNumber returns correct intervenor`() {
        val i1 = Intervenor(1, "ID123", "passport", "Alice", "alice@mail.com", "Street 1")
        val i2 = Intervenor(2, "ID456", "idCard", "Bob", "bob@mail.com", "Street 2")
        repo.save(i1)
        repo.save(i2)

        val found = repo.findByIdNumber("ID123")
        assertEquals(i1, found)
        val notFound = repo.findByIdNumber("ID999")
        assertNull(notFound)
    }

    @Test
    fun `findByContactInfo returns correct intervenor`() {
        val i1 = Intervenor(1, "ID123", "passport", "Alice", "alice@mail.com", "Street 1")
        val i2 = Intervenor(2, "ID456", "idCard", "Bob", "bob@mail.com", "Street 2")
        repo.save(i1)
        repo.save(i2)

        val found = repo.findByContactInfo("alice@mail.com")
        assertEquals(i1, found)
        val notFound = repo.findByContactInfo("unknown@mail.com")
        assertNull(notFound)
    }

    @Test
    fun `save replaces existing intervenor with same id`() {
        val i1 = Intervenor(1, "ID123", "passport", "Alice", "alice@mail.com", "Street 1")
        repo.save(i1)

        val updated = i1.copy(name = "Alice Updated")
        repo.save(updated)

        val found = repo.findById(1)
        assertEquals("Alice Updated", found!!.name)
    }
}