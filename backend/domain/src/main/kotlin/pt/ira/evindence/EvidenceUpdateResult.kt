package pt.ira.evindence

import pt.ira.occurrence.Occurrence

data class EvidenceUpdateResult(
    val reporterId: Int,
    val occurrenceId: Int,
    val evidence: Evidence,
    val occurrence: Occurrence,
    val reporterEvidences: List<Evidence>,
)
