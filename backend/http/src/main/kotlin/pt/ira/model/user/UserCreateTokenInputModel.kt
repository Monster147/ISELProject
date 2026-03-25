package pt.ira.model.user

data class UserCreateTokenInputModel(
    val email: String,
    val password: String,
)
