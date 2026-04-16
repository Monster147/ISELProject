package pt.ira.jdbi

import org.jdbi.v3.core.Jdbi
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.postgresql.ds.PGSimpleDataSource
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class RepositoryDocumentsJdbiTest {
    companion object {
        private val jdbi: Jdbi =
            Jdbi.create(
                PGSimpleDataSource().apply {
                    setURL(Environment.getDbUrl())
                },
            ).configureWithAppRequirements()

        private val trxManager = TransactionManagerJdbi(jdbi)
    }

    @BeforeEach
    fun setup() {
        trxManager.run {
            repoDocuments.clear()
        }
    }

    @Test
    fun `uploadDocumentInfo and findById`() {
        trxManager.run {
            val doc = repoDocuments.uploadDocumentInfo("doc1", "pdf", "/path/doc1.pdf")

            val found = repoDocuments.findById(doc.id)

            assertNotNull(found)
            assertEquals(doc, found)
        }
    }

    @Test
    fun `findAll returns all documents`() {
        trxManager.run {
            val d1 = repoDocuments.uploadDocumentInfo("doc1", "pdf", "f1")
            val d2 = repoDocuments.uploadDocumentInfo("doc2", "img", "f2")

            val all = repoDocuments.findAll()

            assertEquals(listOf(d1, d2), all)
        }
    }

    @Test
    fun `findByName returns correct document`() {
        trxManager.run {
            val d1 = repoDocuments.uploadDocumentInfo("doc1", "pdf", "f1")
            repoDocuments.uploadDocumentInfo("doc2", "pdf", "f2")

            val result = repoDocuments.findByName("doc1")

            assertEquals(d1, result)
        }
    }

    @Test
    fun `findByName returns null when not found`() {
        trxManager.run {
            repoDocuments.uploadDocumentInfo("doc1", "pdf", "f1")

            val result = repoDocuments.findByName("unknown")

            assertNull(result)
        }
    }

    @Test
    fun `findByType returns correct documents`() {
        trxManager.run {
            val d1 = repoDocuments.uploadDocumentInfo("doc1", "pdf", "f1")
            repoDocuments.uploadDocumentInfo("doc2", "img", "f2")

            val result = repoDocuments.findByType("pdf")

            assertEquals(listOf(d1), result)
        }
    }

    @Test
    fun `findAllTypes returns distinct ordered types`() {
        trxManager.run {
            repoDocuments.uploadDocumentInfo("doc1", "pdf", "f1")
            repoDocuments.uploadDocumentInfo("doc2", "img", "f2")
            repoDocuments.uploadDocumentInfo("doc3", "pdf", "f3")

            val types = repoDocuments.findAllTypes()

            // DISTINCT + ORDER BY type
            assertEquals(listOf("img", "pdf"), types)
        }
    }

    @Test
    fun `deleteById removes document`() {
        trxManager.run {
            val doc = repoDocuments.uploadDocumentInfo("doc1", "pdf", "f1")

            repoDocuments.deleteById(doc.id)

            val found = repoDocuments.findById(doc.id)
            assertNull(found)
        }
    }

    @Test
    fun `save updates existing document`() {
        trxManager.run {
            val doc = repoDocuments.uploadDocumentInfo("doc1", "pdf", "f1")

            val updated = doc.copy(name = "updated", type = "img")

            repoDocuments.save(updated)

            val found = repoDocuments.findById(doc.id)

            assertNotNull(found)
            assertEquals("updated", found.name)
            assertEquals("img", found.type)
        }
    }

    @Test
    fun `clear removes all documents`() {
        trxManager.run {
            repoDocuments.uploadDocumentInfo("doc1", "pdf", "f1")
            repoDocuments.uploadDocumentInfo("doc2", "img", "f2")

            repoDocuments.clear()

            assertTrue(repoDocuments.findAll().isEmpty())
        }
    }
}
