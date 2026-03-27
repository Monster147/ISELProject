package pt.ira.mem

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import pt.ira.interfaces.RepositoryEvidence
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class RepositoryEvidenceMemTest {
    private lateinit var repo: RepositoryEvidence
    private val mapper = ObjectMapper()

    private fun json(str: String) = mapper.readTree(str)

    @BeforeEach
    fun setup() {
        repo = RepositoryEvidenceMem()
    }

    @Test
    fun `createEvidence and findById`() {
        val evidence =
            repo.createEvidence(
                json("""{"type":"image"}"""),
                "path/file.png",
                "Lisbon",
                "desc",
                1,
                10,
            )

        val found = repo.findById(evidence.id)

        assertEquals(evidence, found)
    }

    @Test
    fun `findAll returns all evidences`() {
        val e1 = repo.createEvidence(json("""{}"""), "f1", "L1", "d1", 1, 1)
        val e2 = repo.createEvidence(json("""{}"""), "f2", "L2", "d2", 2, 2)

        val all = repo.findAll()

        assertEquals(2, all.size)
        assertEquals(listOf(e1, e2), all)
    }

    @Test
    fun `findByReportId returns correct evidences`() {
        val e1 = repo.createEvidence(json("""{}"""), "f1", "L1", "d1", 1, 100)
        repo.createEvidence(json("""{}"""), "f2", "L2", "d2", 1, 200)

        val result = repo.findByReportId(100)

        assertEquals(listOf(e1), result)
    }

    @Test
    fun `findByReporterId returns correct evidences`() {
        val e1 = repo.createEvidence(json("""{}"""), "f1", "L1", "d1", 1, 100)
        repo.createEvidence(json("""{}"""), "f2", "L2", "d2", 2, 100)

        val result = repo.findByReporterId(1)

        assertEquals(listOf(e1), result)
    }

    @Test
    fun `findByType returns correct evidences`() {
        val typeA = json("""{"type":"A"}""")
        val typeB = json("""{"type":"B"}""")

        val e1 = repo.createEvidence(typeA, "f1", "L1", "d1", 1, 1)
        repo.createEvidence(typeB, "f2", "L2", "d2", 1, 1)

        val result = repo.findByType(typeA)

        assertEquals(listOf(e1), result)
    }

    @Test
    fun `findByLocation returns correct evidences`() {
        val e1 = repo.createEvidence(json("""{}"""), "f1", "Lisboa", "d1", 1, 1)
        repo.createEvidence(json("""{}"""), "f2", "Porto", "d2", 1, 1)

        val result = repo.findByLocation("Lisboa")

        assertEquals(listOf(e1), result)
    }

    @Test
    fun `deleteById removes evidence`() {
        val evidence = repo.createEvidence(json("""{}"""), "f", "L", "d", 1, 1)

        repo.deleteById(evidence.id)
        val found = repo.findById(evidence.id)

        assertNull(found)
    }

    @Test
    fun `save updates existing evidence`() {
        val evidence = repo.createEvidence(json("""{}"""), "f", "L", "d", 1, 1)

        val updated = evidence.copy(description = "updated")

        repo.save(updated)

        val found = repo.findById(evidence.id)

        assertNotNull(found)
        assertEquals("updated", found.description)
    }

    @Test
    fun `clear removes all evidences`() {
        repo.createEvidence(json("""{}"""), "f1", "L1", "d1", 1, 1)
        repo.createEvidence(json("""{}"""), "f2", "L2", "d2", 2, 2)

        repo.clear()

        assertTrue(repo.findAll().isEmpty())
    }
}
