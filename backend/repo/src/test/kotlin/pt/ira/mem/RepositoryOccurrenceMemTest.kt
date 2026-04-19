package pt.ira.mem

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import pt.ira.interfaces.RepositoryOccurrence
import pt.ira.intervenor.Intervenor
import pt.ira.occurrence.OccurrenceType
import java.time.LocalDate
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class RepositoryOccurrenceMemTest {
    private lateinit var repo: RepositoryOccurrence
    private val mapper = ObjectMapper()

    @BeforeEach
    fun setup() {
        repo = RepositoryOccurrenceMem()
    }

    @Test
    fun `createOccurrence and findById`() {
        val created =
            repo.createOccurrence(
                endDate = LocalDate.of(2030, 3, 30),
                reporterId = 1,
                importance = OccurrenceType.NORMAL,
                occurrenceType = 1,
                occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
            )

        val found = repo.findById(created.id)

        assertNotNull(found)
        assertEquals(created.id, found.id)
        assertEquals(created.endDate, found.endDate)
        assertEquals(created.reporterId, found.reporterId)
        assertEquals(created.importance, found.importance)
        assertEquals(created.occurrenceType, found.occurrenceType)
        assertEquals(created.occurrenceInfo, found.occurrenceInfo)
        assertTrue(found.initDate <= found.endDate)
    }

    @Test
    fun `findAll returns all occurrences`() {
        val o1 =
            repo.createOccurrence(
                LocalDate.of(2030, 3, 30),
                1,
                OccurrenceType.NORMAL,
                1,
                mapper.readTree("""{"i":"a"}"""),
            )

        val o2 =
            repo.createOccurrence(
                LocalDate.of(2030, 4, 1),
                2,
                OccurrenceType.URGENT,
                1,
                mapper.readTree("""{"i":"b"}"""),
            )

        val all = repo.findAll()

        assertEquals(2, all.size)
        assertEquals(listOf(o1, o2), all)
    }

    @Test
    fun `findByImportance returns only matches`() {
        val o1 =
            repo.createOccurrence(
                LocalDate.of(2030, 3, 30),
                1,
                OccurrenceType.NORMAL,
                1,
                mapper.readTree("""{"i":"a"}"""),
            )

        repo.createOccurrence(
            LocalDate.of(2030, 4, 1),
            2,
            OccurrenceType.URGENT,
            1,
            mapper.readTree("""{"i":"b"}"""),
        )

        val o3 =
            repo.createOccurrence(
                LocalDate.of(2030, 4, 2),
                3,
                OccurrenceType.NORMAL,
                1,
                mapper.readTree("""{"i":"c"}"""),
            )

        val normals = repo.findByImportance(OccurrenceType.NORMAL)

        assertEquals(listOf(o1, o3), normals)
    }

    @Test
    fun `findOccurrenceByReporterId returns only occurrences that contain that reporter`() {
        val o1 =
            repo.createOccurrence(
                LocalDate.of(2030, 3, 30),
                1,
                OccurrenceType.NORMAL,
                1,
                mapper.readTree("""{"i":"a"}"""),
            )

        val o2 =
            repo.createOccurrence(
                LocalDate.of(2030, 4, 1),
                1,
                OccurrenceType.URGENT,
                1,
                mapper.readTree("""{"i":"b"}"""),
            )

        repo.createOccurrence(
            LocalDate.of(2030, 4, 2),
            3,
            OccurrenceType.CRITICAL,
            1,
            mapper.readTree("""{"i":"c"}"""),
        )

        val by1 = repo.findOccurrenceByReporterId(1)

        assertEquals(listOf(o1, o2), by1)
    }

    @Test
    fun `save updates an existing occurrence`() {
        val created =
            repo.createOccurrence(
                LocalDate.of(2030, 3, 30),
                1,
                OccurrenceType.NORMAL,
                1,
                mapper.readTree("""{"i":"a"}"""),
            )

        val updated =
            created.copy(
                endDate = LocalDate.of(2030, 4, 10),
                reporterId = 5,
                importance = OccurrenceType.CRITICAL,
                occurrenceType = 1,
                occurrenceInfo = mapper.readTree("""{"i":"updated"}"""),
            )

        repo.save(updated)

        val found = repo.findById(created.id)

        assertEquals(updated, found)
    }

    @Test
    fun `deleteById removes occurrence`() {
        val created =
            repo.createOccurrence(
                LocalDate.of(2030, 3, 30),
                1,
                OccurrenceType.NORMAL,
                1,
                mapper.readTree("""{"i":"a"}"""),
            )

        repo.deleteById(created.id)

        assertNull(repo.findById(created.id))
        assertTrue(repo.findAll().isEmpty())
    }

    @Test
    fun `clear removes all occurrences`() {
        repo.createOccurrence(
            LocalDate.of(2030, 3, 30),
            1,
            OccurrenceType.NORMAL,
            1,
            mapper.readTree("""{"i":"a"}"""),
        )

        repo.createOccurrence(
            LocalDate.of(2030, 4, 1),
            2,
            OccurrenceType.URGENT,
            1,
            mapper.readTree("""{"i":"b"}"""),
        )

        repo.clear()

        assertTrue(repo.findAll().isEmpty())
    }

    @Test
    fun `addIntervenor adds intervenor correctly`() {
        val occurrence =
            repo.createOccurrence(
                LocalDate.of(2030, 3, 30),
                1,
                OccurrenceType.NORMAL,
                1,
                mapper.readTree("""{"i":"a"}"""),
            )
        val intervenor = Intervenor(1, "159874598", "CC", "TestName", "958768396", "RUA TESTE")

        val updatedReport = repo.addIntervenor(occurrence, intervenor)
        val updatedFromRepo = repo.findById(occurrence.id)

        assertNotNull(updatedFromRepo)
        Assertions.assertTrue(updatedFromRepo.intervenors.contains(intervenor.id))
        assertEquals(updatedReport, updatedFromRepo)
    }

    @Test
    fun `addIntervenor does not duplicate intervenor`() {
        val occurrence =
            repo.createOccurrence(
                LocalDate.of(2030, 3, 30),
                1,
                OccurrenceType.NORMAL,
                1,
                mapper.readTree("""{"i":"a"}"""),
            )
        val intervenor = Intervenor(1, "159874598", "CC", "TestName", "958768396", "RUA TESTE")

        val once = repo.addIntervenor(occurrence, intervenor)
        val twice = repo.addIntervenor(once, intervenor)

        assertEquals(1, twice.intervenors.count { it == intervenor.id })
    }

    @Test
    fun `removeIntervenor removes intervenor`() {
        val occurrence =
            repo.createOccurrence(
                LocalDate.of(2030, 3, 30),
                1,
                OccurrenceType.NORMAL,
                1,
                mapper.readTree("""{"i":"a"}"""),
            )
        val intervenor = Intervenor(1, "159874598", "CC", "TestName", "958768396", "RUA TESTE")

        val withIntervenor = repo.addIntervenor(occurrence, intervenor)
        val removed = repo.removeIntervenor(withIntervenor, intervenor)

        val updated = repo.findById(occurrence.id)

        assertNotNull(updated)
        Assertions.assertTrue(updated.intervenors.isEmpty())
        assertEquals(removed, updated)
    }

    @Test
    fun `removeIntervenor does nothing if not present`() {
        val occurrence =
            repo.createOccurrence(
                LocalDate.of(2030, 3, 30),
                1,
                OccurrenceType.NORMAL,
                1,
                mapper.readTree("""{"i":"a"}"""),
            )
        val intervenor = Intervenor(1, "159874598", "CC", "TestName", "958768396", "RUA TESTE")

        val removed = repo.removeIntervenor(occurrence, intervenor)
        val updated = repo.findById(occurrence.id)

        assertNotNull(updated)
        assertEquals(occurrence, removed)
        assertEquals(occurrence, updated)
    }

    @Test
    fun `findByIntervenor returns correct reports`() {
        val intervenor = Intervenor(1, "159874598", "CC", "TestName", "958768396", "RUA TESTE")
        val occurrence =
            repo.createOccurrence(
                LocalDate.of(2030, 3, 30),
                1,
                OccurrenceType.NORMAL,
                1,
                mapper.readTree("""{"i":"a"}"""),
            )

        repo.addIntervenor(occurrence, intervenor)

        val result = repo.findByIntervenor(intervenor)

        assertEquals(listOf(repo.findById(occurrence.id)), result)
    }
}
