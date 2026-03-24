package pt.ira

import com.fasterxml.jackson.databind.JsonNode

data class ReportTypePercentage(
    val type: JsonNode,
    val count: Int,
    val percentage: Double,
)
