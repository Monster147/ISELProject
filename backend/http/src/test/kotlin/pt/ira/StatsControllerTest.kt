package pt.ira

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import pt.ira.interfaces.TransactionManager
import pt.ira.occurrence.OccurrenceType
import pt.ira.report.ReportStatus
import pt.ira.user.PasswordValidationInfo
import java.time.LocalDate
import kotlin.test.assertEquals

@SpringJUnitConfig(TestConfig::class)
class StatsControllerTest {
    private val objectMapper = ObjectMapper()

    private fun json(v: String) = objectMapper.readTree(v)

    @Autowired
    private lateinit var statsController: StatsController

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
            repoType.createType(
                "type",
                json("""{"field":"value"}"""),
            ).id
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
    fun `getOverviewStats returns overview statistics`() {
        val user = createUser("user", "user@mail")

        createOccurrence(user.id)
        createOccurrence(user.id)

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
                filePath = ""
            )
        }

        val response = statsController.getOverviewStats()

        assertEquals(HttpStatus.OK, response.statusCode)

        val body = response.body as pt.ira.statistics.OverviewStats

        assertEquals(1, body.totalUsers)
        assertEquals(2, body.totalOccurrences)
        assertEquals(1, body.totalReports)
        assertEquals(0, body.totalEvidences)
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
                filePath = ""
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
                filePath = ""
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
                filePath = ""
            )
        }

        val response = statsController.getStatsReportByType()

        assertEquals(HttpStatus.OK, response.statusCode)

        val body = response.body as List<*>

        assertEquals(2, body.size)
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
                    filePath = ""
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
                    filePath = ""
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
                    filePath = ""
                )

            repoReport.updateStatus(r1, ReportStatus.APPROVED)
            repoReport.updateStatus(r2, ReportStatus.APPROVED)
            repoReport.updateStatus(r3, ReportStatus.REJECTED)
        }

        val response = statsController.getStatsReportByStatus()

        assertEquals(HttpStatus.OK, response.statusCode)

        val body = response.body as List<*>

        assertEquals(2, body.size)
    }

    @Test
    fun `getStatsOccurrenceByImportance returns grouped statistics`() {
        val user = createUser("user", "user@mail")

        createOccurrence(user.id, OccurrenceType.NORMAL)
        createOccurrence(user.id, OccurrenceType.CRITICAL)

        val response = statsController.getStatsOccurrenceByImportance()

        assertEquals(HttpStatus.OK, response.statusCode)

        val body = response.body as List<*>

        assertEquals(2, body.size)
    }

    @Test
    fun `getStatsReportByTypeThisMonth returns current month statistics`() {
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
                filePath = ""
            )
        }

        val response = statsController.getStatsReportByTypeThisMonth()

        assertEquals(HttpStatus.OK, response.statusCode)

        val body = response.body as List<*>

        assertEquals(1, body.size)
    }

    @Test
    fun `getStatsReportByStatusThisMonth returns current month statistics`() {
        val user = createUser("user", "user@mail")
        val occurrence = createOccurrence(user.id)

        trxManager.run {
            val report =
                repoReport.createReport(
                    creatorId = user.id,
                    occurrenceId = occurrence.id,
                    title = "r1",
                    description = "desc",
                    type = 1,
                    addons = json("""{}"""),
                    intervenors = listOf(),
                    language = "en",
                    filePath = ""
                )

            repoReport.updateStatus(report, ReportStatus.APPROVED)
        }

        val response = statsController.getStatsReportByStatusThisMonth()

        assertEquals(HttpStatus.OK, response.statusCode)

        val body = response.body as List<*>

        assertEquals(1, body.size)
    }

    @Test
    fun `getStatsOccurrenceByImportanceThisMonth returns current month statistics`() {
        val user = createUser("user", "user@mail")

        createOccurrence(user.id, OccurrenceType.URGENT)

        val response = statsController.getStatsOccurrenceByImportanceThisMonth()

        assertEquals(HttpStatus.OK, response.statusCode)

        val body = response.body as List<*>

        assertEquals(1, body.size)
    }

    @Test
    fun `stats endpoints return empty lists when no data exists`() {
        val reportType = statsController.getStatsReportByType()
        val reportStatus = statsController.getStatsReportByStatus()
        val occurrenceImportance = statsController.getStatsOccurrenceByImportance()

        assertEquals(emptyList<Any>(), reportType.body)
        assertEquals(emptyList<Any>(), reportStatus.body)
        assertEquals(emptyList<Any>(), occurrenceImportance.body)
    }
}
