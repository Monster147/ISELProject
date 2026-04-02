package pt.ira.model.occurrence

import com.fasterxml.jackson.databind.JsonNode
import pt.ira.occurrence.OccurrenceType
import java.time.LocalDate

data class OccurrenceCreateInput(
    val usersId: Int,
    val endDate: LocalDate,
    val importance: OccurrenceType,
    val occurrenceType: JsonNode,
    val occurrenceInfo: JsonNode,
)