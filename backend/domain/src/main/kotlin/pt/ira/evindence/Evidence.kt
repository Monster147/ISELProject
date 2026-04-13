package pt.ira.evindence

import com.fasterxml.jackson.databind.JsonNode

data class Evidence(
    val id: Int,
    // JSONB
    val type: JsonNode,
    val filePath: String,
    val location: String,
    val description: String,
    val occurrenceId: Int,
    val reporterId: Int,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
)
