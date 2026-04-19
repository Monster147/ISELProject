package pt.ira.type

import com.fasterxml.jackson.databind.JsonNode

data class Type(
    val id: Int,
    val name: String,
    val form: JsonNode,
)
