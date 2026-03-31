package pt.ira.model.occurrence

import pt.ira.occurrence.OccurrenceType
import java.time.LocalDate

data class OccurrenceCreateInput(
    val usersId: List<Int>,
    val endDate: LocalDate,
    val importance: OccurrenceType
)