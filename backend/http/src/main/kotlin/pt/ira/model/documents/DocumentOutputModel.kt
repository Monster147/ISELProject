package pt.ira.model.documents

data class DocumentOutputModel(
    val id: Int,
    val name: String,
    val type: String,
    val filepath: String,
)
