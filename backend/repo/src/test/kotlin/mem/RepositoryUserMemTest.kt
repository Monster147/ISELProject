package mem

import PasswordValidationInfo
import Token
import TokenValidationInfo
import interfaces.RepositoryUser
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.time.Instant
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull

class RepositoryUserMemTest {
    private lateinit var repo: RepositoryUser

    @BeforeEach
    fun setup() {
        repo = RepositoryUserMem()
    }

    @Test
    fun `createUser and findById`() {
        val user = repo.createUser("Alice", "alice@isel.pt", PasswordValidationInfo("hash"), listOf(Role.Admin))
        val found = repo.findById(user.id)
        assertEquals(user, found)
    }

    @Test
    fun `findByEmail returns correct user`() {
        val user = repo.createUser("Bob", "bob@isel.pt", PasswordValidationInfo("hash2"), listOf(Role.Admin))
        val found = repo.findByEmail("bob@isel.pt")
        assertEquals(user, found)
        assertNull(repo.findByEmail("notfound@isel.pt"))
    }

    @Test
    fun `getAll returns all users`() {
        val user = repo.createUser("Alice", "alice@isel.pt", PasswordValidationInfo("hash"), listOf(Role.Admin))
        val user2 = repo.createUser("Bob", "bob@isel.pt", PasswordValidationInfo("hash2"), listOf(Role.Admin))
        val usersFound = repo.findAll()
        assertEquals(2, usersFound.size)
        assertEquals(listOf(user, user2), usersFound)
    }

    @Test
    fun `createUser and update its name and email and check changes`() {
        val user = repo.createUser("Alice", "alice@isel.pt", PasswordValidationInfo("hash"), listOf(Role.Admin))
        val found = repo.findById(user.id)
        assertEquals(user, found)
        val updatedUser = user.copy(name = "AliceUpdated", email = "updated@land.com")
        repo.save(updatedUser)
        val foundUpdated = repo.findById(user.id)
        assertEquals(updatedUser, foundUpdated)
    }

    @Test
    fun `deleteById removes the user`() {
        val user = repo.createUser("Abilio", "abilio@hotmail.com", PasswordValidationInfo("hash3"), listOf(Role.Admin))
        val deleted = repo.deleteById(user.id)
        val shouldBeNull = repo.findById(user.id)
        assertEquals(true, deleted)
        assertNull(shouldBeNull)
    }

    @Test
    fun `createToken and getTokenByTokenValidationInfo`() {
        val user = repo.createUser("Carol", "carol@isel.pt", PasswordValidationInfo("hash3"), listOf(Role.Admin))
        val tokenValidationInfo = TokenValidationInfo("token123")
        val now = Instant.now()
        val token = Token(tokenValidationInfo, user.id, now, now)
        repo.createToken(token, maxTokens = 2)
        val result = repo.getTokenByTokenValidationInfo(tokenValidationInfo)
        assertNotNull(result)
        assertEquals(user, result.first)
        assertEquals(token, result.second)
    }

    @Test
    fun `createToken removes oldest when maxTokens exceeded`() {
        val user = repo.createUser("Dave", "dave@isel.pt", PasswordValidationInfo("hash4"), listOf(Role.Admin))
        val init = Instant.now().minusSeconds(60)
        val t1 = Token(TokenValidationInfo("t1"), user.id, init, Instant.now().minusSeconds(10))
        val t2 = Token(TokenValidationInfo("t2"), user.id, init, Instant.now().minusSeconds(5))
        val t3 = Token(TokenValidationInfo("t3"), user.id, init, Instant.now())
        repo.createToken(t1, maxTokens = 2)
        repo.createToken(t2, maxTokens = 2)
        repo.createToken(t3, maxTokens = 2)
        // t1 should be removed
        assertNull(repo.getTokenByTokenValidationInfo(TokenValidationInfo("t1")))
        assertNotNull(repo.getTokenByTokenValidationInfo(TokenValidationInfo("t2")))
        assertNotNull(repo.getTokenByTokenValidationInfo(TokenValidationInfo("t3")))
    }

    @Test
    fun `updateTokenLastUsed replaces token`() {
        val user = repo.createUser("Eve", "eve@isel.pt", PasswordValidationInfo("hash5"), listOf(Role.Admin))
        val info = TokenValidationInfo("tokenEve")
        val init = Instant.now().minusSeconds(200)
        val tokenOld = Token(info, user.id, init, Instant.now().minusSeconds(100))
        repo.createToken(tokenOld, maxTokens = 2)
        val tokenNew = Token(info, user.id, init, Instant.now())
        repo.updateTokenLastUsed(tokenNew, tokenNew.lastUsedAt)
        val result = repo.getTokenByTokenValidationInfo(info)
        assertNotNull(result)
        assertEquals(tokenNew, result.second)
    }

    @Test
    fun `removeTokenByValidationInfo removes token`() {
        val user = repo.createUser("Frank", "frank@isel.pt", PasswordValidationInfo("hash6"), listOf(Role.Admin))
        val info = TokenValidationInfo("tokenFrank")
        val token = Token(info, user.id, Instant.now(), Instant.now())
        repo.createToken(token, maxTokens = 2)
        val removed = repo.removeTokenByValidationInfo(info)
        assertEquals(1, removed)
        assertNull(repo.getTokenByTokenValidationInfo(info))
    }

    @Test
    fun `findUsersByRole returns correct users`() {
        val user1 = repo.createUser("Grace", "grace@gmail.com", PasswordValidationInfo("hash7"), listOf(Role.Admin))
        val user2 =
            repo.createUser("Heidi", "heidi@gmail.com", PasswordValidationInfo("hash8"), listOf(Role.Investigator))
        val user3 = repo.createUser("Ivan", "ivan@gmail.com", PasswordValidationInfo("hash9"), listOf(Role.InsuranceCo))
        val user4 = repo.createUser("André", "galvao@gmail.com", PasswordValidationInfo("hash10"), listOf(Role.Admin, Role.Investigator, Role.InsuranceCo))
        val admins = repo.findUsersByRole(Role.Admin)
        val investigators = repo.findUsersByRole(Role.Investigator)
        val insuranceCos = repo.findUsersByRole(Role.InsuranceCo)
        assertEquals(listOf(user1, user4), admins)
        assertEquals(listOf(user2, user4), investigators)
        assertEquals(listOf(user3, user4), insuranceCos)
    }
}