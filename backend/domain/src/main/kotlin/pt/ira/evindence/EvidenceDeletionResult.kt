package pt.ira.evindence

import pt.ira.occurrence.Occurrence

data class EvidenceDeletionResult(
    val reporterId: Int,
    val evidences: List<Evidence>,
    val occurrences: List<Occurrence>,
)
