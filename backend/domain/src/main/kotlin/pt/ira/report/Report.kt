package pt.ira.report

import com.fasterxml.jackson.databind.JsonNode

data class Report(
    val id: Int,
    val creatorId: Int,
    val occurrenceId: Int,
    val title: String,
    val description: String,
    val status: ReportStatus = ReportStatus.EDITING,
    val type: JsonNode,
    val addons: JsonNode,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val editors: List<Int> = listOf(),
)
