package pt.ira

data class Evidence (
    val id: Int,
    val type: String,      // JSONB
    val filePath: String,
    val location: String,
    val description: String,
    val reporterId: Int?,
    val reportId: Int?,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
)