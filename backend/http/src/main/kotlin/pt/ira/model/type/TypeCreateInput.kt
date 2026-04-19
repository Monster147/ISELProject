package pt.ira.model.type

import com.fasterxml.jackson.databind.JsonNode

data class TypeCreateInput(
    val name: String,
    val form: JsonNode,
)