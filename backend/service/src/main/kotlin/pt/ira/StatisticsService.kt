package pt.ira

import org.springframework.stereotype.Component
import pt.ira.interfaces.TransactionManager
import pt.ira.occurrence.Occurrence
import pt.ira.report.Report
import pt.ira.statistics.OverviewStats
import pt.ira.statistics.StatsOccurrenceImportance
import pt.ira.statistics.StatsReportStatus
import pt.ira.statistics.StatsReportType
import java.time.Instant
import java.time.YearMonth
import java.time.ZoneId
import kotlin.math.round

@Component
class StatisticsService(
    private val trxManager: TransactionManager,
){
    fun getOverviewStatistics(): OverviewStats = trxManager.run {
        val totalUsers = repoUsers.findAll().size
        val totalOccurrences = repoOccurrence.findAll().size
        val totalReports = repoReport.findAll().size
        val totalEvidences = repoEvidence.findAll().size

        OverviewStats(
            totalUsers = totalUsers,
            totalOccurrences = totalOccurrences,
            totalReports = totalReports,
            totalEvidences = totalEvidences,
        )
    }

    fun getStatsReportByType(): List<StatsReportType> = trxManager.run {
        val reports = repoReport.findAll()
        if (reports.isEmpty()) return@run emptyList()
        val totalReports = reports.size.toDouble()
        reports
            .groupBy { it.type }
            .map { (type, group) ->
                val count = group.size
                val rawPercentage = (count / totalReports) * 100.0
                val rounded = round(rawPercentage * 10) / 10
                StatsReportType(
                    type = type,
                    count = count,
                    percentage = rounded
                )
            }
    }

    fun getStatsReportByStatus(): List<StatsReportStatus> = trxManager.run {
        val reports = repoReport.findAll()
        if (reports.isEmpty()) return@run emptyList()
        val totalReports = reports.size.toDouble()
        reports
            .groupBy { it.status }
            .map { (status, group) ->
                val count = group.size
                val rawPercentage = (count / totalReports) * 100.0
                val rounded = round(rawPercentage * 10) / 10
                StatsReportStatus(
                    status = status,
                    count = count,
                    percentage = rounded
                )
            }
    }

    fun getStatsOccurrenceByImportance(): List<StatsOccurrenceImportance> =  trxManager.run {
        val occurrences = repoOccurrence.findAll()
        if (occurrences.isEmpty()) return@run emptyList()
        val totalOccurrences = occurrences.size.toDouble()
        occurrences
            .groupBy { it.importance }
            .map { (importance, group) ->
                val count = group.size
                val rawPercentage = (count / totalOccurrences) * 100.0
                val rounded = round(rawPercentage * 10) / 10
                StatsOccurrenceImportance(
                    importance = importance,
                    count = count,
                    percentage = rounded
                )
            }
    }

    fun getStatsReportByTypeThisMonth(): List<StatsReportType> = trxManager.run {
        val reports = repoReport.findAll()
        if (reports.isEmpty()) return@run emptyList()
        val reportsThisMonth = getCurrentMonthReports(reports)
        if (reportsThisMonth.isEmpty()) return@run emptyList()
        val totalReports = reportsThisMonth.size.toDouble()
        reportsThisMonth
            .groupBy { it.type }
            .map { (type, group) ->
                val count = group.size
                val rawPercentage = (count / totalReports) * 100.0
                val rounded = round(rawPercentage * 10) / 10
                StatsReportType(
                    type = type,
                    count = count,
                    percentage = rounded
                )
            }
    }

    fun getStatsReportByStatusThisMonth(): List<StatsReportStatus> = trxManager.run {
        val reports = repoReport.findAll()
        if (reports.isEmpty()) return@run emptyList()
        val reportsThisMonth = getCurrentMonthReports(reports)
        if (reportsThisMonth.isEmpty()) return@run emptyList()
        val totalReports = reportsThisMonth.size.toDouble()
        reportsThisMonth
            .groupBy { it.status }
            .map { (status, group) ->
                val count = group.size
                val rawPercentage = (count / totalReports) * 100.0
                val rounded = round(rawPercentage * 10) / 10
                StatsReportStatus(
                    status = status,
                    count = count,
                    percentage = rounded
                )
            }
    }

    fun getStatsOccurrenceByImportanceThisMonth(): List<StatsOccurrenceImportance> =  trxManager.run {
        val occurrences = repoOccurrence.findAll()
        if (occurrences.isEmpty()) return@run emptyList()
        val occurrenceThisMonth = getCurrentMonthOccurrence(occurrences)
        if (occurrenceThisMonth.isEmpty()) return@run emptyList()
        val totalOccurrences = occurrenceThisMonth.size.toDouble()
        occurrenceThisMonth
            .groupBy { it.importance }
            .map { (importance, group) ->
                val count = group.size
                val rawPercentage = (count / totalOccurrences) * 100.0
                val rounded = round(rawPercentage * 10) / 10
                StatsOccurrenceImportance(
                    importance = importance,
                    count = count,
                    percentage = rounded
                )
            }
    }


    private fun getCurrentMonthReports(reports: List<Report>): List<Report> {
        val zone = ZoneId.systemDefault()
        val month = YearMonth.now(zone)
        return reports.filter {
            val reportMonth = YearMonth.from(
                Instant.ofEpochMilli(it.createdAt).atZone(zone)
            )
            reportMonth == month
        }
    }

    private fun getCurrentMonthOccurrence(reports: List<Occurrence>): List<Occurrence> {
        val zone = ZoneId.systemDefault()
        val month = YearMonth.now(zone)
        return reports.filter {
            val occurrenceMonth = YearMonth.from(it.initDate)
            occurrenceMonth == month
        }
    }
}
