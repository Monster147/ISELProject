package pt.ira.report

import org.springframework.core.io.Resource

data class DownloadReport(
    val report: Report,
    val resource: Resource,
)
