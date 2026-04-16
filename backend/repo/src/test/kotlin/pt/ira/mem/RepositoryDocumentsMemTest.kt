package pt.ira.mem

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import pt.ira.interfaces.RepositoryDocuments
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class RepositoryDocumentsMemTest {
    private lateinit var repo: RepositoryDocuments

    @BeforeEach
    fun setup() {
        repo = RepositoryDocumentsMem()
    }

    @Test
    fun `uploadDocumentInfo and findById`() {
        val doc = repo.uploadDocumentInfo("doc1", "pdf", "/path/doc1.pdf")

        val found = repo.findById(doc.id)

        assertEquals(doc, found)
    }

    @Test
    fun `findAll returns all documents`() {
        val d1 = repo.uploadDocumentInfo("doc1", "pdf", "f1")
        val d2 = repo.uploadDocumentInfo("doc2", "img", "f2")

        val all = repo.findAll()

        assertEquals(2, all.size)
        assertEquals(listOf(d1, d2), all)
    }

    @Test
    fun `findByName returns correct document`() {
        val d1 = repo.uploadDocumentInfo("doc1", "pdf", "f1")
        repo.uploadDocumentInfo("doc2", "pdf", "f2")

        val result = repo.findByName("doc1")

        assertEquals(d1, result)
    }

    @Test
    fun `findByName returns null when not found`() {
        repo.uploadDocumentInfo("doc1", "pdf", "f1")

        val result = repo.findByName("unknown")

        assertNull(result)
    }

    @Test
    fun `findByType returns correct documents`() {
        val d1 = repo.uploadDocumentInfo("doc1", "pdf", "f1")
        repo.uploadDocumentInfo("doc2", "img", "f2")

        val result = repo.findByType("pdf")

        assertEquals(listOf(d1), result)
    }

    @Test
    fun `findAllTypes returns all types`() {
        repo.uploadDocumentInfo("doc1", "pdf", "f1")
        repo.uploadDocumentInfo("doc2", "img", "f2")

        val types = repo.findAllTypes()

        assertEquals(listOf("pdf", "img"), types)
    }

    @Test
    fun `deleteById removes document`() {
        val doc = repo.uploadDocumentInfo("doc1", "pdf", "f1")

        repo.deleteById(doc.id)

        val found = repo.findById(doc.id)
        assertNull(found)
    }

    @Test
    fun `save updates existing document`() {
        val doc = repo.uploadDocumentInfo("doc1", "pdf", "f1")

        val updated = doc.copy(name = "updated")

        repo.save(updated)

        val found = repo.findById(doc.id)

        assertNotNull(found)
        assertEquals("updated", found.name)
    }

    @Test
    fun `clear removes all documents`() {
        repo.uploadDocumentInfo("doc1", "pdf", "f1")
        repo.uploadDocumentInfo("doc2", "img", "f2")

        repo.clear()

        assertTrue(repo.findAll().isEmpty())
    }
}
