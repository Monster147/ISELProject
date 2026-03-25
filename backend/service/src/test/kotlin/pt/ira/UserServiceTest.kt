package pt.ira

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import java.time.Instant
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertIs
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

@SpringJUnitConfig(TestConfig::class)
class UserServiceTest {
    @Autowired
    private lateinit var userService: UserService

    @Autowired
    private lateinit var passwordEncoder: PasswordEncoder

    @Test
    fun `createUser stores user and encodes password`() {
        val user = userService.createUser("Alice", "alice@isel.pt", "password123").let {
            check(it is Success)
            it.value
        }

        assertEquals("Alice", user.name)
        assertEquals("alice@isel.pt", user.email)
        assertTrue(passwordEncoder.matches("password123", user.passwordValidation.validationInfo))
    }

    @Test
    fun `createUser fails if email already exists`() {
        userService.createUser("Alice", "alice@isel.pt", "password123")

        val result = userService.createUser("Alice2", "alice@isel.pt", "password123")

        assertIs<Either.Left<*>>(result)
        assertIs<UserError.AlreadyUsedEmailAddress>(result.value)
    }

    @Test
    fun `createUser fails if password is insecure`() {
        val result = userService.createUser("Bob", "bob@isel.pt", "123")

        assertIs<Either.Left<*>>(result)
        assertIs<UserError.InsecurePassword>(result.value)
    }

    @Test
    fun `createUser fails if role does not exist`() {
        val result = userService.createUser("Carol", "carol@isel.pt", "password123", listOf(999))

        assertIs<Either.Left<*>>(result)
        assertIs<UserError.RoleDoesntExist>(result.value)
    }

    @Test
    fun `findUserByEmail returns user`() {
        val created = userService.createUser("Dave", "dave@isel.pt", "password123").let {
            check(it is Success)
            it.value
        }

        val found = userService.findUserByEmail("dave@isel.pt").let {
            check(it is Success)
            it.value
        }

        assertEquals(created.id, found.id)
    }

    @Test
    fun `findUserByEmail fails if not found`() {
        val result = userService.findUserByEmail("notfound@isel.pt")

        assertIs<Either.Left<*>>(result)
        assertIs<UserError.UserNotFound>(result.value)
    }

    @Test
    fun `findUserById returns user`() {
        val created = userService.createUser("André", "galvão@isel.pt", "password123").let {
            check(it is Success)
            it.value
        }

        val found = userService.findUserById(created.id).let {
            check(it is Success)
            it.value
        }

        assertEquals(created.id, found.id)
    }

    @Test
    fun `findUserById fails if not found`() {
        val result = userService.findUserById(999)

        assertIs<Either.Left<*>>(result)
        assertIs<UserError.UserNotFound>(result.value)
    }

    @Test
    fun `addRole adds role to user`() {
        val user = userService.createUser("Eve", "eve@isel.pt", "password123").let {
            check(it is Success)
            it.value
        }

        val updated = userService.addRole(user.id, 1).let {
            check(it is Success)
            it.value
        }

        assertTrue(updated.roles.contains(1))
    }

    @Test
    fun `addRole fails if user does not exist`() {
        val result = userService.addRole(999, 1)

        assertIs<Either.Left<*>>(result)
        assertIs<UserError.UserNotFound>(result.value)
    }

    @Test
    fun `addRole fails if role does not exist`() {
        val user = userService.createUser("Frank", "frank@isel.pt", "password123").let {
            check(it is Success); it.value
        }

        val result = userService.addRole(user.id, 999)

        assertIs<Either.Left<*>>(result)
        assertIs<UserError.RoleDoesntExist>(result.value)
    }

    @Test
    fun `removeRole removes role from user`() {
        val user = userService.createUser("Gina", "gina@isel.pt", "password123", listOf(1)).let {
            check(it is Success)
            it.value
        }

        val updated = userService.removeRole(user.id, 1).let {
            check(it is Success)
            it.value
        }

        assertFalse(updated.roles.contains(1))
    }

    @Test
    fun `setRole replaces roles`() {
        val user = userService.createUser("Henry", "henry@isel.pt", "password123", listOf(1)).let {
            check(it is Success)
            it.value
        }

        val updated = userService.setRole(user.id, listOf(2)).let {
            check(it is Success)
            it.value
        }

        assertEquals(listOf(2), updated.roles)
    }

    @Test
    fun `findUsersByRoles returns users`() {
        userService.createUser("Ivy", "ivy@isel.pt", "password123", listOf(1))

        val users = userService.findUsersByRoles(1).let {
            check(it is Success)
            it.value
        }

        assertTrue(users.isNotEmpty())
    }

    @Test
    fun `findUsersByRoles fails if none found`() {
        val result = userService.findUsersByRoles(999)

        assertIs<Either.Left<*>>(result)
        assertIs<UserError.UserNotFound>(result.value)
    }

    @Test
    fun `createToken returns token for valid credentials`() {
        userService.createUser("Jack", "jack@isel.pt", "password123")

        val tokenInfo = userService.createToken("jack@isel.pt", "password123").let {
            check(it is Success)
            it.value
        }

        assertTrue(tokenInfo.tokenValue.isNotEmpty())
        assertTrue(tokenInfo.tokenExpiration.isAfter(Instant.now()))
    }

    @Test
    fun `getUserByToken returns user for valid token`() {
        val user = userService.createUser("Kate", "kate@isel.pt", "password123").let {
            check(it is Success)
            it.value
        }

        val token = userService.createToken("kate@isel.pt", "password123").let {
            check(it is Success)
            it.value
        }

        val found = userService.getUserByToken(token.tokenValue)

        assertNotNull(found)
        assertEquals(user.id, found.id)
    }

    @Test
    fun `revokeToken removes token`() {
        userService.createUser("Leo", "leo@isel.pt", "password123")

        val token = userService.createToken("leo@isel.pt", "password123").let {
            check(it is Success)
            it.value
        }

        assertTrue(userService.revokeToken(token.tokenValue))

        val found = userService.getUserByToken(token.tokenValue)
        assertNull(found)
    }

    @Test
    fun `createToken fails with wrong password`() {
        userService.createUser("Mike", "mike@isel.pt", "password123")

        val result = userService.createToken("mike@isel.pt", "wrong")

        assertIs<Either.Left<*>>(result)
        assertIs<TokenCreationError.UserOrPasswordAreInvalid>(result.value)
    }

    @Test
    fun `getUserByToken returns null for invalid token`() {
        val result = userService.getUserByToken("invalid")

        assertNull(result)
    }

}