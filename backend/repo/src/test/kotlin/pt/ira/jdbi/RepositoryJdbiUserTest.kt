package pt.ira.jdbi

import org.jdbi.v3.core.Jdbi
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.postgresql.ds.PGSimpleDataSource
import pt.ira.PasswordValidationInfo
import pt.ira.Token
import pt.ira.TokenValidationInfo
import java.time.Instant
import java.time.temporal.ChronoUnit.SECONDS
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull

class RepositoryJdbiUserTest {

    companion object {
        private val jdbi: Jdbi =
            Jdbi
                .create(
                    PGSimpleDataSource().apply {
                        val url = Environment.getDbUrl()
                        setURL(url)
                    },
                ).configureWithAppRequirements()

        private val trxManager = TransactionManagerJdbi(jdbi)
    }

    @BeforeEach
    fun setup() {
        trxManager.run {
            repoUsers.clear()
        }
    }

    @Test
    fun `createUser and findById`() {
        trxManager.run {
            val user = repoUsers.createUser("Alice", "alice@isel.pt", PasswordValidationInfo("hash"), listOf(1))
            val found = repoUsers.findById(user.id)
            assertEquals(user, found)
        }
    }

    @Test
    fun `findByEmail returns correct user`() {
        trxManager.run {
            val user = repoUsers.createUser("Bob", "bob@isel.pt", PasswordValidationInfo("hash2"), listOf(1))
            val found = repoUsers.findByEmail("bob@isel.pt")
            assertEquals(user, found)
            assertNull(repoUsers.findByEmail("notfound@isel.pt"))
        }
    }

    @Test
    fun `getAll returns all users`() {
        trxManager.run {
            val user = repoUsers.createUser("Alice", "alice@isel.pt", PasswordValidationInfo("hash"), listOf(1))
            val user2 = repoUsers.createUser("Bob", "bob@isel.pt", PasswordValidationInfo("hash2"), listOf(1))
            val usersFound = repoUsers.findAll()
            assertEquals(2, usersFound.size)
            assertEquals(listOf(user, user2), usersFound)
        }
    }

    @Test
    fun `createUser and update its name and email and check changes`() {
        trxManager.run {
            val user = repoUsers.createUser("Alice", "alice@isel.pt", PasswordValidationInfo("hash"), listOf(1))
            val found = repoUsers.findById(user.id)
            assertEquals(user, found)
            val updatedUser = user.copy(name = "AliceUpdated", email = "updated@land.com")
            repoUsers.save(updatedUser)
            val foundUpdated = repoUsers.findById(user.id)
            assertEquals(updatedUser, foundUpdated)
        }
    }

    @Test
    fun `deleteById removes the user`() {
        trxManager.run {
            val user = repoUsers.createUser("Abilio", "abilio@hotmail.com", PasswordValidationInfo("hash3"), listOf(1))
            repoUsers.deleteById(user.id)
            val shouldBeNull = repoUsers.findById(user.id)
            assertNull(shouldBeNull)
        }
    }

    @Test
    fun `createToken and getTokenByTokenValidationInfo`() {
        trxManager.run {
            val user = repoUsers.createUser("Carol", "carol@isel.pt", PasswordValidationInfo("hash3"), listOf(1))
            val tokenValidationInfo = TokenValidationInfo("token123")
            val now = Instant.now().truncatedTo(SECONDS)
            val token = Token(tokenValidationInfo, user.id, now, now)
            repoUsers.createToken(token, maxTokens = 2)
            val result = repoUsers.getTokenByTokenValidationInfo(tokenValidationInfo)
            assertNotNull(result)
            assertEquals(user, result.first)
            assertEquals(token, result.second)
        }
    }

    @Test
    fun `createToken removes oldest when maxTokens exceeded`() {
        trxManager.run {
            val user = repoUsers.createUser("Dave", "dave@isel.pt", PasswordValidationInfo("hash4"), listOf(1))
            val init = Instant.now().minusSeconds(60)
            val t1 = Token(TokenValidationInfo("t1"), user.id, init, Instant.now().minusSeconds(10))
            val t2 = Token(TokenValidationInfo("t2"), user.id, init, Instant.now().minusSeconds(5))
            val t3 = Token(TokenValidationInfo("t3"), user.id, init, Instant.now())
            repoUsers.createToken(t1, maxTokens = 2)
            repoUsers.createToken(t2, maxTokens = 2)
            repoUsers.createToken(t3, maxTokens = 2)
            assertNull(repoUsers.getTokenByTokenValidationInfo(TokenValidationInfo("t1")))
            assertNotNull(repoUsers.getTokenByTokenValidationInfo(TokenValidationInfo("t2")))
            assertNotNull(repoUsers.getTokenByTokenValidationInfo(TokenValidationInfo("t3")))
        }
    }

    @Test
    fun `updateTokenLastUsed replaces token`() {
        trxManager.run {
            val user = repoUsers.createUser("Eve", "eve@isel.pt", PasswordValidationInfo("hash5"), listOf(1))
            val info = TokenValidationInfo("tokenEve")
            val init = Instant.now().truncatedTo(SECONDS).minusSeconds(200)
            val tokenOld = Token(info, user.id, init, Instant.now().minusSeconds(100))
            repoUsers.createToken(tokenOld, maxTokens = 2)
            val tokenNew = Token(info, user.id, init, Instant.now().truncatedTo(SECONDS))
            repoUsers.updateTokenLastUsed(tokenNew, tokenNew.lastUsedAt)
            val result = repoUsers.getTokenByTokenValidationInfo(info)
            assertNotNull(result)
            assertEquals(tokenNew, result.second)
        }
    }

    @Test
    fun `removeTokenByValidationInfo removes token`() {
        trxManager.run {
            val user = repoUsers.createUser("Frank", "frank@isel.pt", PasswordValidationInfo("hash6"), listOf(1))
            val info = TokenValidationInfo("tokenFrank")
            val token = Token(info, user.id, Instant.now(), Instant.now())
            repoUsers.createToken(token, maxTokens = 2)
            val removed = repoUsers.removeTokenByValidationInfo(info)
            assertEquals(1, removed)
            assertNull(repoUsers.getTokenByTokenValidationInfo(info))
        }
    }

    @Test
    fun `findUsersByRole returns correct users`() {
        trxManager.run {
            val user1 = repoUsers.createUser("Grace", "grace@gmail.com", PasswordValidationInfo("hash7"), listOf(1))
            val user2 = repoUsers.createUser("Heidi", "heidi@gmail.com", PasswordValidationInfo("hash8"), listOf(2))
            val user3 = repoUsers.createUser("Ivan", "ivan@gmail.com", PasswordValidationInfo("hash9"), listOf(3))
            val user4 = repoUsers.createUser("André", "galvao@gmail.com", PasswordValidationInfo("hash10"), listOf(1, 2, 3))
            val admins = repoUsers.findUsersByRole(1)
            val investigators = repoUsers.findUsersByRole(2)
            val insuranceCos = repoUsers.findUsersByRole(3)
            assertEquals(listOf(user1, user4), admins)
            assertEquals(listOf(user2, user4), investigators)
            assertEquals(listOf(user3, user4), insuranceCos)
        }
    }
}
