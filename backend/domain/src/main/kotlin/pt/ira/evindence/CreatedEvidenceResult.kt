package pt.ira.evindence

import pt.ira.occurrence.Occurrence

data class CreatedEvidenceResult(
    val evidence: Evidence,
    val reporterEvidences: List<Evidence>,
    val updatedOccurrence: Occurrence,
    val occurrences: List<Occurrence>,
)
