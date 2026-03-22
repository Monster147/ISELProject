package pt.ira.mem

import pt.ira.PasswordValidationInfo
import pt.ira.Role
import pt.ira.Token
import pt.ira.TokenValidationInfo
import pt.ira.User
import pt.ira.interfaces.RepositoryUser
import java.time.Instant

class RepositoryUserMem : RepositoryUser {
    private val users = mutableListOf<User>()
    private val tokens = mutableListOf<Token>()

    override fun createUser(
        name: String,
        email: String,
        passwordValidation: PasswordValidationInfo,
        roles: List<Int>,
    ): User = User(users.size + 1, name, email, passwordValidation, roles).also {
        users.add(it)
    }

    override fun findByEmail(email: String): User? = users.find { it.email == email }

    override fun getTokenByTokenValidationInfo(tokenValidationInfo: TokenValidationInfo): Pair<User, Token>? =
        tokens.firstOrNull { it.tokenValidationInfo == tokenValidationInfo }?.let {
            val user = findById(it.userId)
            requireNotNull(user)
            user to it
        }

    override fun createToken(token: Token, maxTokens: Int) {
        val nrOfTokens = tokens.count { it.userId == token.userId }

        // Remove the oldest token if we have achieved the maximum number of tokens
        if (nrOfTokens >= maxTokens) {
            tokens
                .filter { it.userId == token.userId }
                .minByOrNull { it.lastUsedAt }!!
                .also { tk -> tokens.removeIf { it.tokenValidationInfo == tk.tokenValidationInfo } }
        }
        tokens.add(token)
    }

    override fun updateTokenLastUsed(token: Token, now: Instant) {
        tokens.removeIf { it.tokenValidationInfo == token.tokenValidationInfo }
        tokens.add(token)
    }

    override fun removeTokenByValidationInfo(tokenValidationInfo: TokenValidationInfo): Int {
        val count = tokens.count { it.tokenValidationInfo == tokenValidationInfo }
        tokens.removeAll { it.tokenValidationInfo == tokenValidationInfo }
        return count
    }

    override fun findUsersByRole(role: Int): List<User> = users.filter { it.roles.contains(role) }

    override fun addRole(user: User, roleId: Int): User {
        val updatedUser= user.copy(roles = user.roles + roleId)
        save(updatedUser)
        return updatedUser
    }

    override fun removeRole(user: User, roleId: Int): User {
        val updateUser = user.copy(roles = user.roles - roleId)
        save(updateUser)
        return updateUser
    }

    override fun setRoles(user: User, roleIds: List<Int>): User {
        val updatedUser = user.copy(roles = roleIds)
        save(updatedUser)
        return updatedUser
    }

    override fun findById(id: Int): User? = users.find { it.id == id }

    override fun findAll(): List<User> = users.toList()

    override fun save(entity: User) {
        users.removeIf { it.id == entity.id }
        users.add(entity)
    }

    override fun deleteById(id: Int) {
        users.removeIf { it.id == id }
    }

    override fun clear() {
        users.clear()
        tokens.clear()
    }
}