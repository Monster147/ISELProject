package pt.ira

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import pt.ira.interfaces.TransactionManager
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertTrue

@SpringJUnitConfig(TestConfig::class)
class EvidenceServiceTest {
    @Autowired
    private lateinit var evidenceService: EvidenceService

    @Autowired
    private lateinit var trxManager: TransactionManager

    private val objectMapper = ObjectMapper()

    private fun json(value: String) = objectMapper.readTree(value)

    @BeforeEach
    fun reset() {
        trxManager.run {
            repoEvidence.clear()
        }
    }

    @Test
    fun `createEvidence creates evidence`() {
        val evidence = evidenceService.createEvidence(
            type = json("""{"type":"image"}"""),
            filePath = "/tmp/file1",
            location = "Lisboa",
            description = "desc",
            reporterId = 1,
            reportId = 1
        ).let {
            check(it is Success)
            it.value
        }

        assertEquals("/tmp/file1", evidence.filePath)
        assertEquals("Lisboa", evidence.location)
    }

    @Test
    fun `findById returns evidence`() {
        val created = evidenceService.createEvidence(
            json("""{"type":"video"}"""),
            "/tmp/file2",
            "Porto",
            "desc",
            2,
            2
        ).let {
            check(it is Success)
            it.value
        }

        val found = evidenceService.findById(created.id).let {
            check(it is Success); it.value
        }

        assertEquals(created.id, found.id)
    }

    @Test
    fun `findById fails if not found`() {
        val result = evidenceService.findById(999)

        assertIs<Either.Left<*>>(result)
        assertIs<EvidenceError.EvidenceNotFound>(result.value)
    }

    @Test
    fun `findByReportId returns evidences`() {
        evidenceService.createEvidence(json("""{"type":"a"}"""), "f1", "Lisboa", "d", 1, 10)
        evidenceService.createEvidence(json("""{"type":"b"}"""), "f2", "Porto", "d", 2, 10)

        val result = evidenceService.findByReportId(10)

        assertEquals(2, result.size)
    }

    @Test
    fun `findByReporterId returns evidences`() {
        evidenceService.createEvidence(json("""{"type":"a"}"""), "f1", "Lisboa", "d", 20, 1)
        evidenceService.createEvidence(json("""{"type":"b"}"""), "f2", "Porto", "d", 20, 2)

        val result = evidenceService.findByReporterId(20)

        assertEquals(2, result.size)
    }

    @Test
    fun `findByType returns evidences`() {
        val type = json("""{"type":"image"}""")

        evidenceService.createEvidence(type, "f1", "Lisboa", "d", 1, 1)
        evidenceService.createEvidence(json("""{"type":"video"}"""), "f2", "Porto", "d", 2, 2)

        val result = evidenceService.findByType(type)

        assertEquals(1, result.size)
    }

    @Test
    fun `findByLocation returns evidences`() {
        evidenceService.createEvidence(json("""{"type":"a"}"""), "f1", "Lisboa", "d", 1, 1)
        evidenceService.createEvidence(json("""{"type":"b"}"""), "f2", "Lisboa", "d", 2, 2)

        val result = evidenceService.findByLocation("Lisboa")

        assertEquals(2, result.size)
    }

    @Test
    fun `findAll returns all evidences`() {
        evidenceService.createEvidence(json("""{"type":"a"}"""), "f1", "Lisboa", "d", 1, 1)
        evidenceService.createEvidence(json("""{"type":"b"}"""), "f2", "Porto", "d", 2, 2)

        val result = evidenceService.findAll()

        assertTrue(result.size >= 2)
    }

    @Test
    fun `deleteById removes evidence`() {
        val created = evidenceService.createEvidence(
            json("""{"type":"x"}"""),
            "file-delete",
            "Lisboa",
            "d",
            1,
            1
        ).let {
            check(it is Success)
            it.value
        }

        val result = evidenceService.deleteById(created.id)

        assertIs<Success<Boolean>>(result)
        assertTrue(result.value)

        val find = evidenceService.findById(created.id)
        assertIs<Either.Left<*>>(find)
        assertIs<EvidenceError.EvidenceNotFound>(find.value)
    }

    @Test
    fun `deleteById fails if not found`() {
        val result = evidenceService.deleteById(999)

        assertIs<Either.Left<*>>(result)
        assertIs<EvidenceError.EvidenceNotFound>(result.value)
    }
}