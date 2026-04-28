package pt.ira.statistics

import pt.ira.occurrence.OccurrenceType

data class StatsOccurrenceImportance(
    val importance: OccurrenceType,
    val count: Int,
    val percentage: Double,
)