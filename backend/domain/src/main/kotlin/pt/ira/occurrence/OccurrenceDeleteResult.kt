package pt.ira.occurrence

data class OccurrenceDeleteResult(
    val reporterId: Int,
    val occurrences: List<Occurrence>,
)
