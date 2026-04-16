package pt.ira

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.mock.web.MockMultipartFile
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import pt.ira.interfaces.TransactionManager
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertTrue

@SpringJUnitConfig(TestConfig::class)
class DocumentsServiceTest {
    @Autowired
    private lateinit var documentsService: DocumentsService

    @Autowired
    private lateinit var trxManager: TransactionManager

    private fun file(
        name: String = "${UUID.randomUUID()}.pdf",
        contentType: String = "application/pdf",
        content: ByteArray = "dummy".toByteArray(),
    ): MockMultipartFile {
        return MockMultipartFile("file", name, contentType, content)
    }

    private fun randomName() = UUID.randomUUID().toString()

    @BeforeEach
    fun reset() {
        trxManager.run {
            repoDocuments.clear()
        }
    }

    @Test
    fun `uploadDocument creates document`() {
        val name = randomName()

        val result =
            documentsService.uploadDocument(
                name = name,
                type = "pdf",
                file = file(),
            )

        val doc =
            result.let {
                check(it is Success)
                it.value
            }

        assertEquals(name, doc.name)
        assertEquals("pdf", doc.type)
        assertTrue(doc.filepath.isNotEmpty())
    }

    @Test
    fun `uploadDocument fails when contentType is null`() {
        val file = MockMultipartFile("file", "file", null, "data".toByteArray())

        val result = documentsService.uploadDocument(randomName(), "pdf", file)

        assertIs<Either.Left<*>>(result)
        assertIs<DocumentsError.InvalidFile>(result.value)
    }

    @Test
    fun `uploadDocument fails when contentType not allowed`() {
        val file = file(contentType = "application/zip")

        val result = documentsService.uploadDocument(randomName(), "pdf", file)

        assertIs<Either.Left<*>>(result)
        assertIs<DocumentsError.InvalidFile>(result.value)
    }

    @Test
    fun `uploadDocument fails when file is empty`() {
        val file = file(content = ByteArray(0))

        val result = documentsService.uploadDocument(randomName(), "pdf", file)

        assertIs<Either.Left<*>>(result)
        assertIs<DocumentsError.InvalidFile>(result.value)
    }

    @Test
    fun `findDocumentById returns document`() {
        val name = randomName()

        val created =
            documentsService.uploadDocument(name, "pdf", file()).let {
                check(it is Success)
                it.value
            }

        val found =
            documentsService.findDocumentById(created.id).let {
                check(it is Success)
                it.value
            }

        assertEquals(created.id, found.id)
    }

    @Test
    fun `findDocumentById fails when not found`() {
        val result = documentsService.findDocumentById(999)

        assertIs<Either.Left<*>>(result)
        assertIs<DocumentsError.DocumentNotFound>(result.value)
    }

    @Test
    fun `findDocumentByName returns document`() {
        val name = randomName()

        val created =
            documentsService.uploadDocument(name, "pdf", file()).let {
                check(it is Success)
                it.value
            }

        val found =
            documentsService.findDocumentByName(name).let {
                check(it is Success)
                it.value
            }

        assertEquals(created.id, found.id)
    }

    @Test
    fun `findDocumentByName fails when not found`() {
        val result = documentsService.findDocumentByName(randomName())

        assertIs<Either.Left<*>>(result)
        assertIs<DocumentsError.DocumentNotFound>(result.value)
    }

    @Test
    fun `findDocumentsByType returns documents`() {
        documentsService.uploadDocument(randomName(), "pdf", file())
        documentsService.uploadDocument(randomName(), "pdf", file())

        val result =
            documentsService.findDocumentsByType("pdf").let {
                check(it is Success)
                it.value
            }

        assertEquals(2, result.size)
    }

    @Test
    fun `findDocumentsByType fails when empty`() {
        val result = documentsService.findDocumentsByType("pdf")

        assertIs<Either.Left<*>>(result)
        assertIs<DocumentsError.DocumentNotFound>(result.value)
    }

    @Test
    fun `findAllDocumentTypes returns types`() {
        documentsService.uploadDocument(randomName(), "pdf", file())
        documentsService.uploadDocument(randomName(), "img", file(contentType = "image/png"))

        val types = documentsService.findAllDocumentTypes()

        assertTrue(types.contains("pdf"))
        assertTrue(types.contains("img"))
    }

    @Test
    fun `findAllDocuments returns all`() {
        documentsService.uploadDocument(randomName(), "pdf", file())
        documentsService.uploadDocument(randomName(), "img", file(contentType = "image/png"))

        val all = documentsService.findAllDocuments()

        assertEquals(2, all.size)
    }

    @Test
    fun `deleteDocument removes document`() {
        val name = randomName()

        val created =
            documentsService.uploadDocument(name, "pdf", file()).let {
                check(it is Success)
                it.value
            }

        val result = documentsService.deleteDocument(created.id)

        assertIs<Success<Boolean>>(result)
        assertTrue(result.value)

        val find = documentsService.findDocumentById(created.id)
        assertIs<Either.Left<*>>(find)
        assertIs<DocumentsError.DocumentNotFound>(find.value)
    }

    @Test
    fun `deleteDocument fails when not found`() {
        val result = documentsService.deleteDocument(999)

        assertIs<Either.Left<*>>(result)
        assertIs<DocumentsError.DocumentNotFound>(result.value)
    }
}
