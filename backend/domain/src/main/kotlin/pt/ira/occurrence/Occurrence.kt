package pt.ira.occurrence

import java.time.LocalDate


data class Occurrence(
    val id: Int,
    val initDate: LocalDate,
    val endDate: LocalDate,
    val reporterId: List<Int> = listOf(),
    val importance: OccurrenceType = OccurrenceType.NORMAL,
)
