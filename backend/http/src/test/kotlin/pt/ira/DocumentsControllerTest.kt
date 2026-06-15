package pt.ira

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.mock.web.MockMultipartFile
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import pt.ira.documents.Documents
import pt.ira.interfaces.TransactionManager
import pt.ira.model.documents.DocumentInputModel
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertNotNull

@SpringJUnitConfig(TestConfig::class)
class DocumentsControllerTest {
    @Autowired
    private lateinit var controller: DocumentsController

    @Autowired
    private lateinit var trxManager: TransactionManager

    private fun randomName() = UUID.randomUUID().toString()

    private fun file(
        name: String = "${UUID.randomUUID()}.pdf",
        contentType: String = "application/pdf",
        content: ByteArray = "dummy".toByteArray(),
    ) = MockMultipartFile("file", name, contentType, content)

    @BeforeEach
    fun cleanup() {
        trxManager.run {
            repoDocuments.clear()
        }
    }

    @Test
    fun `upload document success`() {
        val input =
            DocumentInputModel(
                name = randomName(),
                type = "pdf",
            )

        val resp = controller.uploadDocument(file(), input)

        assertEquals(HttpStatus.CREATED, resp.statusCode)
        assertNotNull(resp.headers.getFirst(HttpHeaders.LOCATION))
    }

    @Test
    fun `upload document invalid file`() {
        val input =
            DocumentInputModel(
                name = randomName(),
                type = "pdf",
            )

        val invalidFile = file(contentType = "application/zip")

        val resp = controller.uploadDocument(invalidFile, input)

        assertEquals(HttpStatus.BAD_REQUEST, resp.statusCode)
    }

    @Test
    fun `get document by id success`() {
        val id = createDocument()

        val resp = controller.getDocumentById(id)

        assertEquals(HttpStatus.OK, resp.statusCode)
        assertIs<Documents>(resp.body)
    }

    @Test
    fun `get document by id not found`() {
        val resp = controller.getDocumentById(999)

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `get document by name success`() {
        val name = randomName()
        val id = createDocument(name)

        val resp = controller.getDocumentByName(name)

        assertEquals(HttpStatus.OK, resp.statusCode)
        val doc = resp.body as Documents
        assertEquals(id, doc.id)
    }

    @Test
    fun `get document by name not found`() {
        val resp = controller.getDocumentByName(randomName())

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `get documents by type success`() {
        createDocument(type = "pdf")
        createDocument(type = "pdf")

        val resp = controller.getDocumentsByType("pdf")

        assertEquals(HttpStatus.OK, resp.statusCode)
        val list = resp.body as List<*>
        assertEquals(2, list.size)
    }

    @Test
    fun `get documents by type not found`() {
        val resp = controller.getDocumentsByType("pdf")

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `get all document types`() {
        createDocument(type = "pdf")
        createDocument(type = "img")

        val resp = controller.getAllDocumentTypes()

        assertEquals(HttpStatus.OK, resp.statusCode)
        val list = resp.body!!
        assertEquals(2, list.size)
    }

    @Test
    fun `get all documents`() {
        createDocument()
        createDocument()

        val resp = controller.getAllDocuments()

        assertEquals(HttpStatus.OK, resp.statusCode)
        val list = resp.body!!
        assertEquals(2, list.size)
    }

    @Test
    fun `delete document success`() {
        val id = createDocument()

        val resp = controller.deleteDocument(id)

        assertEquals(HttpStatus.NO_CONTENT, resp.statusCode)
    }

    @Test
    fun `delete document not found`() {
        val resp = controller.deleteDocument(999)

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    private fun createDocument(
        name: String = randomName(),
        type: String = "pdf",
    ): Int {
        val resp =
            controller.uploadDocument(
                file(),
                DocumentInputModel(name, type),
            )

        val location = requireNotNull(resp.headers.getFirst(HttpHeaders.LOCATION))
        return location.substringAfterLast("/").toInt()
    }
}
