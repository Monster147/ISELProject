package pt.ira.statistics

import pt.ira.report.ReportStatus

data class StatsReportStatus(
    val status: ReportStatus,
    val count: Int,
    val percentage: Double,
)