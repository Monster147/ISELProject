package pt.ira.interfaces

import pt.ira.token.Token
import pt.ira.token.TokenValidationInfo
import pt.ira.user.PasswordValidationInfo
import pt.ira.user.User
import java.time.Instant

interface RepositoryUser : Repository<User> {
    fun createUser(
        name: String,
        email: String,
        passwordValidation: PasswordValidationInfo,
        roles: List<Int> = listOf(2),
    ): User

    fun findByEmail(email: String): User?

    fun getTokenByTokenValidationInfo(tokenValidationInfo: TokenValidationInfo): Pair<User, Token>?

    fun createToken(
        token: Token,
        maxTokens: Int,
    )

    fun updateTokenLastUsed(
        token: Token,
        now: Instant,
    )

    fun removeTokenByValidationInfo(tokenValidationInfo: TokenValidationInfo): Int

    fun findUsersByRole(role: Int): List<User>

    fun addRole(
        user: User,
        roleId: Int,
    ): User

    fun removeRole(
        user: User,
        roleId: Int,
    ): User

    fun setRoles(
        user: User,
        roleIds: List<Int>,
    ): User
}
