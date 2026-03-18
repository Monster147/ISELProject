package pt.ira

enum class Role (
    val id: Int,
    val displayName: String,
) {
    Admin(1, "admin"),
    Investigator(2, "investigator"),
    InsuranceCo(3, "insuranceCo"),
}