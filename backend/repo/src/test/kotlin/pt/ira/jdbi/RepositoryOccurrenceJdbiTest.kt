package pt.ira.jdbi

import org.jdbi.v3.core.Jdbi
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.postgresql.ds.PGSimpleDataSource
import pt.ira.occurrence.OccurrenceType
import java.sql.Date
import java.time.LocalDate
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class RepositoryOccurrenceJdbiTest {
    companion object {
        private val jdbi: Jdbi =
            Jdbi
                .create(
                    PGSimpleDataSource().apply {
                        val url = Environment.getDbUrl()
                        setURL(url)
                    },
                ).configureWithAppRequirements()

        private val trxManager = TransactionManagerJdbi(jdbi)
    }

    @BeforeEach
    fun setup() {
        trxManager.run {
            repoOccurrence.clear()
        }
    }

    @Test
    fun `createOccurrence and findById`() {
        trxManager.run {
            val created =
                repoOccurrence.createOccurrence(
                    endDate = LocalDate.parse("2030-03-30"),
                    reporterId = listOf(1),
                    importance = OccurrenceType.NORMAL,
                )

            val found = repoOccurrence.findById(created.id)

            assertNotNull(found)
            assertEquals(created.id, found.id)
            assertEquals(created.endDate, found.endDate)
            assertEquals(created.reporterId, found.reporterId)
            assertEquals(created.importance, found.importance)
            assertTrue(found.initDate <= found.endDate)
        }
    }

    @Test
    fun `findAll returns all occurrences`() {
        trxManager.run {
            val o1 =
                repoOccurrence.createOccurrence(
                    endDate = LocalDate.parse("2030-03-30"),
                    reporterId = listOf(1),
                    importance = OccurrenceType.NORMAL,
                )
            val o2 =
                repoOccurrence.createOccurrence(
                    endDate = LocalDate.parse("2030-04-01"),
                    reporterId = listOf(2, 3),
                    importance = OccurrenceType.URGENT,
                )

            val all = repoOccurrence.findAll()

            assertEquals(2, all.size)
            assertEquals(listOf(o1, o2), all)
        }
    }

    @Test
    fun `findByImportance returns only matches`() {
        trxManager.run {
            val o1 =
                repoOccurrence.createOccurrence(
                    endDate = LocalDate.parse("2030-03-30"),
                    reporterId = listOf(1),
                    importance = OccurrenceType.NORMAL,
                )
            repoOccurrence.createOccurrence(
                endDate = LocalDate.parse("2030-04-01"),
                reporterId = listOf(2),
                importance = OccurrenceType.URGENT,
            )
            val o3 =
                repoOccurrence.createOccurrence(
                    endDate = LocalDate.parse("2030-04-02"),
                    reporterId = listOf(3),
                    importance = OccurrenceType.NORMAL,
                )

            val normals = repoOccurrence.findByImportance(OccurrenceType.NORMAL)

            assertEquals(listOf(o1, o3), normals)
        }
    }

    @Test
    fun `findOccurrenceByReporterId returns only occurrences that contain that reporter`() {
        trxManager.run {
            val o1 =
                repoOccurrence.createOccurrence(
                    endDate = LocalDate.parse("2030-03-30"),
                    reporterId = listOf(1, 2),
                    importance = OccurrenceType.NORMAL,
                )
            val o2 =
                repoOccurrence.createOccurrence(
                    endDate = LocalDate.parse("2030-04-01"),
                    reporterId = listOf(2, 3),
                    importance = OccurrenceType.URGENT,
                )
            repoOccurrence.createOccurrence(
                endDate = LocalDate.parse("2030-04-02"),
                reporterId = listOf(4),
                importance = OccurrenceType.CRITICAL,
            )

            val by2 = repoOccurrence.findOccurrenceByReporterId(2)

            assertEquals(listOf(o1, o2), by2)
        }
    }

    @Test
    fun `save updates an existing occurrence`() {
        trxManager.run {
            val created =
                repoOccurrence.createOccurrence(
                    endDate =LocalDate.parse("2030-03-30"),
                    reporterId = listOf(1),
                    importance = OccurrenceType.NORMAL,
                )

            val updated =
                created.copy(
                    endDate = LocalDate.parse("2030-04-10"),
                    reporterId = listOf(1, 5),
                    importance = OccurrenceType.CRITICAL,
                )

            repoOccurrence.save(updated)

            val found = repoOccurrence.findById(created.id)
            assertEquals(updated, found)
        }
    }

    @Test
    fun `deleteById removes occurrence`() {
        trxManager.run {
            val created = repoOccurrence.createOccurrence(
                endDate = LocalDate.parse("2030-03-30"),
                reporterId = listOf(1),
                importance = OccurrenceType.NORMAL,
            )

            repoOccurrence.deleteById(created.id)

            assertNull(repoOccurrence.findById(created.id))
            assertTrue(repoOccurrence.findAll().isEmpty())
        }
    }

    @Test
    fun `clear removes all occurrences`() {
        trxManager.run {
            repoOccurrence.createOccurrence(LocalDate.parse("2030-03-30"), listOf(1), OccurrenceType.NORMAL)
            repoOccurrence.createOccurrence(LocalDate.parse("2030-04-01"), listOf(2), OccurrenceType.URGENT)

            repoOccurrence.clear()

            assertTrue(repoOccurrence.findAll().isEmpty())
        }
    }
}
