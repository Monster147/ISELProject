package pt.ira

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import pt.ira.interfaces.TransactionManager
import pt.ira.occurrence.OccurrenceType
import pt.ira.report.ReportStatus
import pt.ira.statistics.OverviewStats
import pt.ira.user.PasswordValidationInfo
import java.time.LocalDate
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@SpringJUnitConfig(TestConfig::class)
class StatisticsServiceTest {
    private val objectMapper = ObjectMapper()

    private fun json(v: String) = objectMapper.readTree(v)

    @Autowired
    private lateinit var statisticsService: StatisticsService

    @Autowired
    private lateinit var trxManager: TransactionManager

    @BeforeEach
    fun reset() {
        trxManager.run {
            repoReport.clear()
            repoUsers.clear()
            repoIntervenor.clear()
            repoOccurrence.clear()
            repoEvidence.clear()
            repoType.clear()
        }
    }

    private fun createUser(
        name: String,
        email: String,
    ) = trxManager.run {
        repoUsers.createUser(
            name,
            email,
            PasswordValidationInfo("hash"),
            listOf(1),
        )
    }

    private fun createType(): Int =
        trxManager.run {
            repoType.createType("type", json("""{"field":"value"}""")).id
        }

    private fun createOccurrence(
        reporterId: Int,
        importance: OccurrenceType = OccurrenceType.NORMAL,
    ) = trxManager.run {
        repoOccurrence.createOccurrence(
            endDate = LocalDate.now().plusDays(5),
            reporterId = reporterId,
            importance = importance,
            occurrenceType = createType(),
            occurrenceInfo = json("""{}"""),
        )
    }

    @Test
    fun `getOverviewStatistics returns correct totals`() {
        val user = createUser("user", "user@mail")

        createOccurrence(user.id, OccurrenceType.NORMAL)
        createOccurrence(user.id, OccurrenceType.CRITICAL)

        trxManager.run {
            repoReport.createReport(
                creatorId = user.id,
                occurrenceId = 1,
                title = "r1",
                description = "desc",
                type = 1,
                addons = json("""{}"""),
                intervenors = listOf(),
                language = "en",
            )

            repoReport.createReport(
                creatorId = user.id,
                occurrenceId = 2,
                title = "r2",
                description = "desc",
                type = 2,
                addons = json("""{}"""),
                intervenors = listOf(),
                language = "en",
            )
        }

        val result = statisticsService.getOverviewStatistics()

        assertEquals(
            OverviewStats(
                totalUsers = 1,
                totalOccurrences = 2,
                totalReports = 2,
                totalEvidences = 0,
            ),
            result,
        )
    }

    @Test
    fun `getStatsReportByType returns grouped statistics`() {
        val user = createUser("user", "user@mail")
        val occurrence = createOccurrence(user.id)

        trxManager.run {
            repoReport.createReport(
                creatorId = user.id,
                occurrenceId = occurrence.id,
                title = "r1",
                description = "desc",
                type = 1,
                addons = json("""{}"""),
                intervenors = listOf(),
                language = "en",
            )

            repoReport.createReport(
                creatorId = user.id,
                occurrenceId = occurrence.id,
                title = "r2",
                description = "desc",
                type = 1,
                addons = json("""{}"""),
                intervenors = listOf(),
                language = "en",
            )

            repoReport.createReport(
                creatorId = user.id,
                occurrenceId = occurrence.id,
                title = "r3",
                description = "desc",
                type = 2,
                addons = json("""{}"""),
                intervenors = listOf(),
                language = "en",
            )
        }

        val result = statisticsService.getStatsReportByType()

        assertEquals(2, result.size)

        val type1 = result.first { it.type == 1 }
        val type2 = result.first { it.type == 2 }

        assertEquals(2, type1.count)
        assertEquals(66.7, type1.percentage)

        assertEquals(1, type2.count)
        assertEquals(33.3, type2.percentage)
    }

    @Test
    fun `getStatsReportByStatus returns grouped statistics`() {
        val user = createUser("user", "user@mail")
        val occurrence = createOccurrence(user.id)

        trxManager.run {
            val r1 =
                repoReport.createReport(
                    creatorId = user.id,
                    occurrenceId = occurrence.id,
                    title = "r1",
                    description = "desc",
                    type = 1,
                    addons = json("""{}"""),
                    intervenors = listOf(),
                    language = "en",
                )

            val r2 =
                repoReport.createReport(
                    creatorId = user.id,
                    occurrenceId = occurrence.id,
                    title = "r2",
                    description = "desc",
                    type = 1,
                    addons = json("""{}"""),
                    intervenors = listOf(),
                    language = "en",
                )

            val r3 =
                repoReport.createReport(
                    creatorId = user.id,
                    occurrenceId = occurrence.id,
                    title = "r3",
                    description = "desc",
                    type = 1,
                    addons = json("""{}"""),
                    intervenors = listOf(),
                    language = "en",
                )

            repoReport.updateStatus(r1, ReportStatus.APPROVED)
            repoReport.updateStatus(r2, ReportStatus.APPROVED)
            repoReport.updateStatus(r3, ReportStatus.REJECTED)
        }

        val result = statisticsService.getStatsReportByStatus()

        assertEquals(2, result.size)

        val approved = result.first { it.status == ReportStatus.APPROVED }
        val rejected = result.first { it.status == ReportStatus.REJECTED }

        assertEquals(2, approved.count)
        assertEquals(66.7, approved.percentage)

        assertEquals(1, rejected.count)
        assertEquals(33.3, rejected.percentage)
    }

    @Test
    fun `getStatsOccurrenceByImportance returns grouped statistics`() {
        val user = createUser("user", "user@mail")

        createOccurrence(user.id, OccurrenceType.NORMAL)
        createOccurrence(user.id, OccurrenceType.NORMAL)
        createOccurrence(user.id, OccurrenceType.CRITICAL)

        val result = statisticsService.getStatsOccurrenceByImportance()

        assertEquals(2, result.size)

        val normal = result.first { it.importance == OccurrenceType.NORMAL }
        val critical = result.first { it.importance == OccurrenceType.CRITICAL }

        assertEquals(2, normal.count)
        assertEquals(66.7, normal.percentage)

        assertEquals(1, critical.count)
        assertEquals(33.3, critical.percentage)
    }

    @Test
    fun `getStatsReportByType returns empty list when no reports`() {
        val result = statisticsService.getStatsReportByType()

        assertTrue(result.isEmpty())
    }

    @Test
    fun `getStatsReportByStatus returns empty list when no reports`() {
        val result = statisticsService.getStatsReportByStatus()

        assertTrue(result.isEmpty())
    }

    @Test
    fun `getStatsOccurrenceByImportance returns empty list when no occurrences`() {
        val result = statisticsService.getStatsOccurrenceByImportance()

        assertTrue(result.isEmpty())
    }

    @Test
    fun `getStatsReportByTypeThisMonth returns current month reports only`() {
        val user = createUser("user", "user@mail")
        val occurrence = createOccurrence(user.id)

        trxManager.run {
            repoReport.createReport(
                creatorId = user.id,
                occurrenceId = occurrence.id,
                title = "r1",
                description = "desc",
                type = 1,
                addons = json("""{}"""),
                intervenors = listOf(),
                language = "en",
            )

            repoReport.createReport(
                creatorId = user.id,
                occurrenceId = occurrence.id,
                title = "r2",
                description = "desc",
                type = 1,
                addons = json("""{}"""),
                intervenors = listOf(),
                language = "en",
            )
        }

        val result = statisticsService.getStatsReportByTypeThisMonth()

        assertEquals(1, result.size)
        assertEquals(1, result.first().type)
        assertEquals(2, result.first().count)
        assertEquals(100.0, result.first().percentage)
    }

    @Test
    fun `getStatsOccurrenceByImportanceThisMonth returns current month occurrences only`() {
        val user = createUser("user", "user@mail")

        createOccurrence(user.id, OccurrenceType.URGENT)
        createOccurrence(user.id, OccurrenceType.URGENT)

        val result = statisticsService.getStatsOccurrenceByImportanceThisMonth()

        assertEquals(1, result.size)
        assertEquals(OccurrenceType.URGENT, result.first().importance)
        assertEquals(2, result.first().count)
        assertEquals(100.0, result.first().percentage)
    }
}
