package pt.ira.jdbi

import org.jdbi.v3.core.Handle
import org.jdbi.v3.core.kotlin.mapTo
import pt.ira.interfaces.RepositoryUser
import pt.ira.token.Token
import pt.ira.token.TokenValidationInfo
import pt.ira.user.PasswordValidationInfo
import pt.ira.user.User
import java.sql.ResultSet
import java.time.Instant

class RepositoryUserJdbi(
    private val handle: Handle,
) : RepositoryUser {
    private companion object {
        const val USER_COLUMNS = """id, name, email, password_validation, roles"""
    }

    override fun createUser(
        name: String,
        email: String,
        passwordValidation: PasswordValidationInfo,
        roles: List<Int>,
    ): User {
        val id =
            handle
                .createUpdate(
                    """
            INSERT INTO dbo.users (name, email, password_validation, roles) 
            VALUES (:name, :email, :password_validation, :roles)
            RETURNING id
            """,
                ).bind("name", name)
                .bind("email", email)
                .bind("password_validation", passwordValidation.validationInfo)
                .bind("roles", roles.toTypedArray())
                .executeAndReturnGeneratedKeys()
                .mapTo(Int::class.java)
                .one()

        return User(id = id, name = name, email = email, passwordValidation = passwordValidation, roles = roles)
    }

    override fun findByEmail(email: String): User? =
        handle
            .createQuery(
                """
                SELECT $USER_COLUMNS 
                FROM dbo.users
                WHERE email = :email
                """.trimIndent(),
            )
            .bind("email", email)
            .map { rs, _ -> mapRow(rs) }
            .singleOrNull()

    override fun findUsersByRole(role: Int): List<User> =
        handle
            .createQuery(
                """
                SELECT $USER_COLUMNS
                FROM dbo.users
                WHERE :roleId = ANY(roles)
                """.trimIndent(),
            )
            .bind("roleId", role)
            .map { rs, _ -> mapRow(rs) }
            .list()

    override fun addRole(
        user: User,
        roleId: Int,
    ): User {
        if (roleId in user.roles) return user
        val updatedUser = user.copy(roles = user.roles + roleId)
        save(updatedUser)
        return updatedUser
    }

    override fun removeRole(
        user: User,
        roleId: Int,
    ): User {
        if (roleId !in user.roles) return user
        val updateUser = user.copy(roles = user.roles - roleId)
        save(updateUser)
        return updateUser
    }

    override fun setRoles(
        user: User,
        roleIds: List<Int>,
    ): User {
        val updatedUser = user.copy(roles = roleIds)
        save(updatedUser)
        return updatedUser
    }

    override fun getTokenByTokenValidationInfo(tokenValidationInfo: TokenValidationInfo): Pair<User, Token>? =
        handle
            .createQuery(
                """
                SELECT users.id AS id,
                       users.name AS name,
                       users.email AS email,
                       users.password_validation AS password_validation,
                       users.roles AS roles,
                       tokens.token_validation AS token_validation,
                       tokens.created_at AS created_at,
                       tokens.last_used_at AS last_used_at
                FROM dbo.Users AS users
                INNER JOIN dbo.Tokens AS tokens
                ON users.id = tokens.user_id
                WHERE token_validation = :validation_information
                """.trimIndent(),
            ).bind("validation_information", tokenValidationInfo.validationInfo)
            .mapTo<UserAndTokenModel>()
            .singleOrNull()
            ?.userAndToken

    override fun createToken(
        token: Token,
        maxTokens: Int,
    ) {
        val deletions =
            handle
                .createUpdate(
                    """
                    DELETE FROM dbo.Tokens 
                    WHERE user_id = :user_id 
                        AND token_validation IN (
                            SELECT token_validation FROM dbo.Tokens WHERE user_id = :user_id 
                                ORDER BY last_used_at DESC OFFSET :offset
                        )
                    """.trimIndent(),
                ).bind("user_id", token.userId)
                .bind("offset", maxTokens - 1)
                .execute()

        handle
            .createUpdate(
                """
                INSERT INTO dbo.Tokens(user_id, token_validation, created_at, last_used_at) 
                VALUES (:user_id, :token_validation, :created_at, :last_used_at)
                """.trimIndent(),
            ).bind("user_id", token.userId)
            .bind("token_validation", token.tokenValidationInfo.validationInfo)
            .bind("created_at", token.createdAt.epochSecond)
            .bind("last_used_at", token.lastUsedAt.epochSecond)
            .execute()
    }

    override fun updateTokenLastUsed(
        token: Token,
        now: Instant,
    ) {
        handle
            .createUpdate(
                """
                UPDATE dbo.Tokens
                SET last_used_at = :last_used_at
                WHERE token_validation = :validation_information
                """.trimIndent(),
            ).bind("last_used_at", now.epochSecond)
            .bind("validation_information", token.tokenValidationInfo.validationInfo)
            .execute()
    }

    override fun removeTokenByValidationInfo(tokenValidationInfo: TokenValidationInfo): Int =
        handle
            .createUpdate(
                """
                DELETE FROM dbo.Tokens
                WHERE token_validation = :validation_information
                """.trimIndent(),
            ).bind("validation_information", tokenValidationInfo.validationInfo)
            .execute()

    override fun findById(id: Int): User? =
        handle
            .createQuery(
                """
                SELECT $USER_COLUMNS
                FROM dbo.users
                WHERE id = :id
                """.trimIndent(),
            ).bind("id", id)
            .map { rs, _ -> mapRow(rs) }
            .singleOrNull()

    override fun findAll(): List<User> =
        handle
            .createQuery(
                """
                SELECT $USER_COLUMNS 
                FROM dbo.users
                ORDER BY id
                """.trimIndent(),
            ).map { rs, _ -> mapRow(rs) }
            .list()

    override fun save(entity: User) {
        handle
            .createUpdate(
                """
                UPDATE dbo.users 
                SET name = :name,
                    email = :email,
                    roles =:roles
                WHERE id = :id
                """.trimIndent(),
            ).bindBean(entity)
            .execute()
    }

    override fun deleteById(id: Int) {
        handle
            .createUpdate("DELETE FROM dbo.users WHERE id = :id")
            .bind("id", id)
            .execute()
    }

    override fun clear() {
        handle.createUpdate("DELETE FROM dbo.Tokens").execute()
        handle.createUpdate("DELETE FROM dbo.users").execute()
    }

    private data class UserAndTokenModel(
        val id: Int,
        val name: String,
        val email: String,
        val passwordValidation: String,
        val roles: List<Int>,
        val tokenValidation: String,
        val createdAt: Long,
        val lastUsedAt: Long,
    ) {
        val userAndToken: Pair<User, Token>
            get() =
                Pair(
                    User(
                        id,
                        name,
                        email,
                        PasswordValidationInfo(passwordValidation),
                        roles,
                    ),
                    Token(
                        TokenValidationInfo(tokenValidation),
                        id,
                        Instant.ofEpochSecond(createdAt),
                        Instant.ofEpochSecond(lastUsedAt),
                    ),
                )
    }

    private fun mapRow(rs: ResultSet): User {
        val passwordValidation =
            PasswordValidationInfo(
                rs.getString("password_validation"),
            )

        val roles =
            rs.getArray("roles")?.let { arr ->
                (arr.array as Array<*>).map { (it as Number).toInt() }
            } ?: emptyList()

        return User(
            id = rs.getInt("id"),
            name = rs.getString("name"),
            email = rs.getString("email"),
            passwordValidation = passwordValidation,
            roles = roles,
        )
    }
}
