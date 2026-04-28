package pt.ira.model.evidence

import com.fasterxml.jackson.databind.JsonNode

data class CreateEvidenceInput(
    val type: String,
    val location: String,
    val description: String,
    val reporterId: Int,
    val occurrenceId: Int,
)
