package pt.ira.model.type

import com.fasterxml.jackson.databind.JsonNode

data class TypeUpdateInput(
    val name: String?,
    val form: JsonNode?,
)