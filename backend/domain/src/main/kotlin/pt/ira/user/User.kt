package pt.ira.user

data class User(
    val id: Int,
    val name: String,
    val email: String,
    val passwordValidation: PasswordValidationInfo,
    val roles: List<Int>,
)
