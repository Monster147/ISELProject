package pt.ira.model.report

import com.fasterxml.jackson.databind.JsonNode

data class CreateReportInput(
    val creatorId: Int,
    val title: String,
    val description: String,
    val type: JsonNode,
    val addons: JsonNode,
)
