package pt.ira.occurrence

data class OccurrenceCreatedResult(
    val occurrence: Occurrence,
    val userOccurrences: List<Occurrence>,
)
