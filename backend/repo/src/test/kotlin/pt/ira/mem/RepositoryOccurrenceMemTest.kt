package pt.ira.mem

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import pt.ira.interfaces.RepositoryOccurrence
import pt.ira.occurrence.OccurrenceType
import java.sql.Date
import java.time.LocalDate
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class RepositoryOccurrenceMemTest {
    private lateinit var repo: RepositoryOccurrence

    @BeforeEach
    fun setup() {
        repo = RepositoryOccurrenceMem()
    }

    @Test
    fun `createOccurrence and findById`() {
        val created = repo.createOccurrence(
            endDate = LocalDate.parse("2030-03-30"),
            reporterId = listOf(1),
            importance = OccurrenceType.NORMAL,
        )

        val found = repo.findById(created.id)

        assertNotNull(found)
        assertEquals(created.id, found.id)
        assertEquals(created.endDate, found.endDate)
        assertEquals(created.reporterId, found.reporterId)
        assertEquals(created.importance, found.importance)
        assertTrue(found.initDate <= found.endDate)
    }

    @Test
    fun `findAll returns all occurrences`() {
        val o1 = repo.createOccurrence(
            endDate = LocalDate.parse("2030-03-30"),
            reporterId = listOf(1),
            importance = OccurrenceType.NORMAL,
        )
        val o2 = repo.createOccurrence(
            endDate = LocalDate.parse("2030-04-01"),
            reporterId = listOf(2, 3),
            importance = OccurrenceType.URGENT,
        )

        val all = repo.findAll()

        assertEquals(2, all.size)
        assertEquals(listOf(o1, o2), all)
    }

    @Test
    fun `findByImportance returns only matches`() {
        val o1 = repo.createOccurrence(
            endDate = LocalDate.parse("2030-03-30"),
            reporterId = listOf(1),
            importance = OccurrenceType.NORMAL,
        )
        repo.createOccurrence(
            endDate = LocalDate.parse("2030-04-01"),
            reporterId = listOf(2),
            importance = OccurrenceType.URGENT,
        )
        val o3 = repo.createOccurrence(
            endDate = LocalDate.parse("2030-04-02"),
            reporterId = listOf(3),
            importance = OccurrenceType.NORMAL,
        )

        val normals = repo.findByImportance(OccurrenceType.NORMAL)

        assertEquals(listOf(o1, o3), normals)
    }

    @Test
    fun `findOccurrenceByReporterId returns only occurrences that contain that reporter`() {
        val o1 = repo.createOccurrence(
            endDate = LocalDate.parse("2030-03-30"),
            reporterId = listOf(1, 2),
            importance = OccurrenceType.NORMAL,
        )
        val o2 = repo.createOccurrence(
            endDate = LocalDate.parse("2030-04-01"),
            reporterId = listOf(2, 3),
            importance = OccurrenceType.URGENT,
        )
        repo.createOccurrence(
            endDate = LocalDate.parse("2030-04-02"),
            reporterId = listOf(4),
            importance = OccurrenceType.CRITICAL,
        )

        val by2 = repo.findOccurrenceByReporterId(2)

        assertEquals(listOf(o1, o2), by2)
    }

    @Test
    fun `save updates an existing occurrence`() {
        val created = repo.createOccurrence(
            endDate = LocalDate.parse("2030-03-30"),
            reporterId = listOf(1),
            importance = OccurrenceType.NORMAL,
        )

        val updated =
            created.copy(
                endDate = LocalDate.parse("2030-04-10"),
                reporterId = listOf(1, 5),
                importance = OccurrenceType.CRITICAL,
            )

        repo.save(updated)

        val found = repo.findById(created.id)
        assertEquals(updated, found)
    }

    @Test
    fun `deleteById removes occurrence`() {
        val created = repo.createOccurrence(
            endDate = LocalDate.parse("2030-03-30"),
            reporterId = listOf(1),
            importance = OccurrenceType.NORMAL,
        )

        repo.deleteById(created.id)

        assertNull(repo.findById(created.id))
        assertTrue(repo.findAll().isEmpty())
    }

    @Test
    fun `clear removes all occurrences`() {
        repo.createOccurrence(LocalDate.parse("2030-03-30"), listOf(1), OccurrenceType.NORMAL)
        repo.createOccurrence(LocalDate.parse("2030-04-01"), listOf(2), OccurrenceType.URGENT)

        repo.clear()

        assertTrue(repo.findAll().isEmpty())
    }
}
