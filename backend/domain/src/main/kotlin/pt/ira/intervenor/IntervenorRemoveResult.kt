package pt.ira.intervenor

import pt.ira.occurrence.Occurrence

data class IntervenorRemoveResult(
    val occurrence: Occurrence,
    val occurrences: List<Occurrence>,
)
