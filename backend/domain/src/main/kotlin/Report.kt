data class Report(
    val id: Int,
    val creatorId: Int?,
    val title: String,
    val description: String,
    val status: ReportStatus = ReportStatus.EDITING,
    val type: String,
    val addons: String,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val editors: List<User> = listOf(),
)
