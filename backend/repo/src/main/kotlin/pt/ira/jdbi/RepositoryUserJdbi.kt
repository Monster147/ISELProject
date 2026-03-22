package pt.ira.jdbi

import org.jdbi.v3.core.Handle
import org.jdbi.v3.core.kotlin.mapTo
import pt.ira.PasswordValidationInfo
import pt.ira.Role
import pt.ira.Token
import pt.ira.TokenValidationInfo
import pt.ira.User
import pt.ira.interfaces.RepositoryUser
import java.sql.ResultSet
import java.time.Instant
/*
class RepositoryUserJdbi(
    private val handle: Handle
) : RepositoryUser {
    override fun createUser(
        name: String,
        email: String,
        passwordValidation: PasswordValidationInfo,
        roles: List<Int>
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
            .createQuery("SELECT * FROM dbo.users WHERE email = :email")
            .bind("email", email)
            .map { rs, _,
                ->
                mapRow(rs)
            }
            .findOne()
            .orElse(null)

    override fun getTokenByTokenValidationInfo(tokenValidationInfo: TokenValidationInfo): Pair<User, Token>? {
        TODO("Not yet implemented")
    }

    override fun createToken(token: Token, maxTokens: Int) {
        TODO("Not yet implemented")
    }

    override fun updateTokenLastUsed(token: Token, now: Instant) {
        TODO("Not yet implemented")
    }

    override fun removeTokenByValidationInfo(tokenValidationInfo: TokenValidationInfo): Int {
        TODO("Not yet implemented")
    }

    override fun findUsersByRole(role: Int): List<User> {
        TODO("Not yet implemented")
    }

    override fun findById(id: Int): User? {
        TODO("Not yet implemented")
    }

    override fun findAll(): List<User> {
        TODO("Not yet implemented")
    }

    override fun save(entity: User) {
        TODO("Not yet implemented")
    }

    override fun deleteById(id: Int){
        TODO("Not yet implemented")
    }

    override fun clear() {
        TODO("Not yet implemented")
    }

    private fun mapRow(rs: ResultSet): User {
        val id = rs.getInt("id")
        val name = rs.getString("name")
        val email = rs.getString("email")
        val balance = rs.getFloat("balance")
        val invitationCode = rs.getString("invitation_code")

        val passwordValidation =
            PasswordValidationInfo(
                rs.getString("password_validation"),
            )

        return User(
            id = id,
            name = name,
            email = email,
            balance = balance,
            passwordValidation = passwordValidation,
            invitationCode = invitationCode,
        )
    }
}*/