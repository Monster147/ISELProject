package pt.ira

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import pt.ira.interfaces.TransactionManager
import pt.ira.occurrence.OccurrenceType
import pt.ira.user.PasswordValidationInfo
import java.time.Instant
import java.time.LocalDate
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

    @Autowired
    private lateinit var trxManager: TransactionManager

    private val objectMapper = ObjectMapper()

    private fun json(v: String) = objectMapper.readTree(v)

    private fun createOccurrenceForUser(userId: Int) =
        trxManager.run {
            repoOccurrence.createOccurrence(
                endDate = LocalDate.of(2030, 3, 30),
                reporterId = userId,
                importance = OccurrenceType.NORMAL,
                occurrenceType = 1,
                occurrenceInfo = json("""{}"""),
            )
        }

    @BeforeEach
    fun reset() {
        trxManager.run {
            repoReport.clear()
            repoUsers.clear()
            repoIntervenor.clear()
            repoOccurrence.clear()
        }
    }

    @Test
    fun `createUser stores user and encodes password`() {
        val user =
            userService.createUser("Alice", "alice@isel.pt", "password123").let {
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
        val created =
            userService.createUser("Dave", "dave@isel.pt", "password123").let {
                check(it is Success)
                it.value
            }

        val found =
            userService.findUserByEmail("dave@isel.pt").let {
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
        val created =
            userService.createUser("André", "galvao@isel.pt", "password123").let {
                check(it is Success)
                it.value
            }

        val found =
            userService.findUserById(created.id).let {
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
        val user =
            userService.createUser("Eve", "eve@isel.pt", "password123", listOf(1, 2)).let {
                check(it is Success)
                it.value
            } // user has admin role so it can add roles

        val updated =
            userService.addRole(user.id, user.id, 3).let {
                check(it is Success)
                it.value
            }

        assertTrue(updated.roles.contains(3))
    }

    @Test
    fun `addRole fails if user does not exist`() {
        val adminId =
            userService.createUser("Eve", "eve@isel.pt", "password123", listOf(1)).let {
                check(it is Success)
                it.value.id
            }
        val result = userService.addRole(adminId, 999, 1)

        assertIs<Either.Left<*>>(result)
        assertIs<UserError.UserNotFound>(result.value)
    }

    @Test
    fun `addRole fails if role does not exist`() {
        val adminId =
            userService.createUser("Eve", "eve@isel.pt", "password123", listOf(1)).let {
                check(it is Success)
                it.value.id
            }
        val user =
            userService.createUser("Frank", "frank@isel.pt", "password123").let {
                check(it is Success)
                it.value
            }

        val result = userService.addRole(adminId, user.id, 999)

        assertIs<Either.Left<*>>(result)
        assertIs<UserError.RoleDoesntExist>(result.value)
    }

    @Test
    fun `removeRole removes role from user`() {
        val adminId =
            userService.createUser("Eve", "eve@isel.pt", "password123", listOf(1)).let {
                check(it is Success)
                it.value.id
            }
        val user =
            userService.createUser("Gina", "gina@isel.pt", "password123", listOf(1)).let {
                check(it is Success)
                it.value
            }

        val updated =
            userService.removeRole(adminId, user.id, 1).let {
                check(it is Success)
                it.value
            }

        assertFalse(updated.roles.contains(1))
    }

    @Test
    fun `setRole replaces roles`() {
        val adminId =
            userService.createUser("Eve", "eve@isel.pt", "password123", listOf(1)).let {
                check(it is Success)
                it.value.id
            }
        val user =
            userService.createUser("Henry", "henry@isel.pt", "password123", listOf(1)).let {
                check(it is Success)
                it.value
            }

        val updated =
            userService.setRole(adminId, user.id, listOf(2)).let {
                check(it is Success)
                it.value
            }

        assertEquals(listOf(2), updated.roles)
    }

    @Test
    fun `findUsersByRoles returns users`() {
        userService.createUser("Ivy", "ivy@isel.pt", "password123", listOf(1))

        val users =
            userService.findUsersByRoles(1).let {
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

        val tokenInfo =
            userService.createToken("jack@isel.pt", "password123").let {
                check(it is Success)
                it.value
            }

        assertTrue(tokenInfo.tokenValue.isNotEmpty())
        assertTrue(tokenInfo.tokenExpiration.isAfter(Instant.now()))
    }

    @Test
    fun `getUserByToken returns user for valid token`() {
        val user =
            userService.createUser("Kate", "kate@isel.pt", "password123").let {
                check(it is Success)
                it.value
            }

        val token =
            userService.createToken("kate@isel.pt", "password123").let {
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

        val token =
            userService.createToken("leo@isel.pt", "password123").let {
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

    @Test
    fun `getTypePercentagesByReporter returns empty list when no reports`() {
        val result = userService.getTypePercentagesByReporter(999)
        assertTrue(result.isEmpty())
    }

    @Test
    fun `getTypePercentagesByReporter returns 100 percent for single type`() {
        val typeA = 1

        val user =
            trxManager.run {
                repoUsers.createUser("u", "u@mail", PasswordValidationInfo("x"), listOf(1))
            }

        repeat(3) {
            trxManager.run {
                val occ = createOccurrenceForUser(user.id)
                val report =
                    repoReport.createReport(
                        user.id,
                        occ.id,
                        "t$it",
                        "d",
                        typeA,
                        json("""{}"""),
                        occ.intervenors,
                    )
                repoReport.addEditor(report, user)
            }
        }

        val result = userService.getTypePercentagesByReporter(user.id)

        assertEquals(1, result.size)
        val entry = result.first()

        assertEquals(3, entry.count)
        assertEquals(100.0, entry.percentage)
        assertEquals(typeA, entry.type)
    }

    @Test
    fun `getTypePercentagesByReporter only considers reports where user is editor`() {
        val typeA = 1

        val user1 =
            trxManager.run {
                repoUsers.createUser("u1", "u1@mail", PasswordValidationInfo("x"), listOf(1))
            }

        val user2 =
            trxManager.run {
                repoUsers.createUser("u2", "u2@mail", PasswordValidationInfo("x"), listOf(1))
            }

        trxManager.run {
            val occ = createOccurrenceForUser(user1.id)
            val report = repoReport.createReport(user1.id, occ.id, "t1", "d", typeA, json("""{}"""), occ.intervenors)
            repoReport.addEditor(report, user1)
        }

        trxManager.run {
            val occ = createOccurrenceForUser(user2.id)
            val report = repoReport.createReport(user2.id, occ.id, "t2", "d", typeA, json("""{}"""), occ.intervenors)
            repoReport.addEditor(report, user2)
        }

        val result = userService.getTypePercentagesByReporter(user1.id)

        assertEquals(1, result.size)
        assertEquals(1, result.first().count)
    }

    @Test
    fun `getTypePercentagesByReporter calculates correct percentages`() {
        val typeA = 1
        val typeB = 2

        val user =
            trxManager.run {
                repoUsers.createUser("u", "u@mail", PasswordValidationInfo("x"), listOf(1))
            }

        repeat(2) {
            trxManager.run {
                val occ = createOccurrenceForUser(user.id)
                val report = repoReport.createReport(user.id, occ.id, "a$it", "d", typeA, json("""{}"""), occ.intervenors)
                repoReport.addEditor(report, user)
            }
        }

        repeat(1) {
            trxManager.run {
                val occ = createOccurrenceForUser(user.id)
                val report = repoReport.createReport(user.id, occ.id, "b$it", "d", typeB, json("""{}"""), occ.intervenors)
                repoReport.addEditor(report, user)
            }
        }

        val result = userService.getTypePercentagesByReporter(user.id)

        assertEquals(2, result.size)

        val a = result.find { it.type.toString() == typeA.toString() }!!
        val b = result.find { it.type.toString() == typeB.toString() }!!

        assertEquals(2, a.count)
        assertEquals(66.7, a.percentage)

        assertEquals(1, b.count)
        assertEquals(33.3, b.percentage)
    }

    @Test
    fun `getTypePercentagesByReporter sorts by count descending`() {
        val typeA = 1
        val typeB = 2

        val user =
            trxManager.run {
                repoUsers.createUser("u", "u@mail", PasswordValidationInfo("x"), listOf(1))
            }

        repeat(3) {
            trxManager.run {
                val occ = createOccurrenceForUser(user.id)
                val report = repoReport.createReport(user.id, occ.id, "a$it", "d", typeA, json("""{}"""), occ.intervenors)
                repoReport.addEditor(report, user)
            }
        }

        trxManager.run {
            val occ = createOccurrenceForUser(user.id)
            val report = repoReport.createReport(user.id, occ.id, "b", "d", typeB, json("""{}"""), occ.intervenors)
            repoReport.addEditor(report, user)
        }

        val result = userService.getTypePercentagesByReporter(user.id)

        assertEquals(typeA.toString(), result[0].type.toString())
        assertEquals(typeB.toString(), result[1].type.toString())
    }

    @Test
    fun `getTypePercentagesByReporter sorts by type when counts equal`() {
        val typeA = 1
        val typeB = 2

        val user =
            trxManager.run {
                repoUsers.createUser("u", "u@mail", PasswordValidationInfo("x"), listOf(1))
            }

        trxManager.run {
            val occ = createOccurrenceForUser(user.id)
            val report1 = repoReport.createReport(user.id, occ.id, "a", "d", typeA, json("""{}"""), occ.intervenors)
            repoReport.addEditor(report1, user)
        }

        trxManager.run {
            val occ = createOccurrenceForUser(user.id)
            val report2 = repoReport.createReport(user.id, occ.id, "b", "d", typeB, json("""{}"""), occ.intervenors)
            repoReport.addEditor(report2, user)
        }

        val result = userService.getTypePercentagesByReporter(user.id)

        assertEquals(2, result.size)
        assertTrue(result[0].type.toString() <= result[1].type.toString())
    }
}
