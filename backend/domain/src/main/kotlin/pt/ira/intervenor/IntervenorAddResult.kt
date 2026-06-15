package pt.ira.intervenor

import pt.ira.occurrence.Occurrence

data class IntervenorAddResult(
    val updated: Occurrence,
    val userOccurrences: List<Occurrence>,
)
