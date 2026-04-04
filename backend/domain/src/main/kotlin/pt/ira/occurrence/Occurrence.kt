package pt.ira.occurrence

import com.fasterxml.jackson.databind.JsonNode
import java.time.LocalDate

data class Occurrence(
    val id: Int,
    val initDate: LocalDate,
    val endDate: LocalDate,
    val reporterId: Int,
    val importance: OccurrenceType = OccurrenceType.NORMAL,
    val occurrenceType: JsonNode,
    val occurrenceInfo: JsonNode,
    val intervenors: List<Int> = listOf(),
    val evidences: List<Int> = listOf(),
)
