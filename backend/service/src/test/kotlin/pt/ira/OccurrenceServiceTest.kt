package pt.ira

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import pt.ira.interfaces.TransactionManager
import pt.ira.occurrence.OccurrenceType
import pt.ira.user.PasswordValidationInfo
import java.time.LocalDate
import kotlin.test.*

@SpringJUnitConfig(TestConfig::class)
class OccurrenceServiceTest {

    @Autowired
    private lateinit var occurrenceService: OccurrenceService

    @Autowired
    private lateinit var trxManager: TransactionManager

    @BeforeEach
    fun reset() {
        trxManager.run {
            repoReport.clear()
            repoUsers.clear()
            repoIntervenor.clear()
            repoOccurrence.clear()
        }
    }

    private fun createUser(name: String, email: String) =
        trxManager.run {
            repoUsers.createUser(
                name,
                email,
                PasswordValidationInfo("hash"),
                listOf(1)
            )
        }

    @Test
    fun `createOccurrence creates occurrence successfully`() {

        val user = createUser("u", "u@mail")

        val occurrence =
            occurrenceService.createOccurrence(
                usersId = listOf(user.id),
                endDate = LocalDate.now().plusDays(5),
                importance = OccurrenceType.CRITICAL
            ).let {
                check(it is Success)
                it.value
            }

        assertEquals(listOf(user.id), occurrence.reporterId)
        assertEquals(OccurrenceType.CRITICAL, occurrence.importance)
    }

    @Test
    fun `createOccurrence fails when endDate is in the past`() {

        val user = createUser("u", "u@mail")

        val result =
            occurrenceService.createOccurrence(
                usersId = listOf(user.id),
                endDate = LocalDate.now().minusDays(1),
                importance = OccurrenceType.NORMAL
            )

        assertIs<Either.Left<*>>(result)
        assertIs<OccurrenceError.EndDateNotValid>(result.value)
    }

    @Test
    fun `createOccurrence fails when duplicate users ids`() {

        val user = createUser("u", "u@mail")

        val result =
            occurrenceService.createOccurrence(
                usersId = listOf(user.id, user.id),
                endDate = LocalDate.now().plusDays(3)
            )

        assertIs<Either.Left<*>>(result)
        assertIs<OccurrenceError.DuplicateUsersIds>(result.value)
    }

    @Test
    fun `createOccurrence fails when user does not exist`() {

        val result =
            occurrenceService.createOccurrence(
                usersId = listOf(999),
                endDate = LocalDate.now().plusDays(3)
            )

        assertIs<Either.Left<*>>(result)
        assertIs<OccurrenceError.UserNotFound>(result.value)
    }

    @Test
    fun `findById returns occurrence`() {

        val user = createUser("u", "u@mail")

        val created =
            occurrenceService.createOccurrence(
                listOf(user.id),
                LocalDate.now().plusDays(3)
            ).let {
                check(it is Success)
                it.value
            }

        val found =
            occurrenceService.findById(created.id).let {
                check(it is Success)
                it.value
            }

        assertEquals(created.id, found.id)
    }

    @Test
    fun `findById fails when occurrence not found`() {

        val result = occurrenceService.findById(999)

        assertIs<Either.Left<*>>(result)
        assertIs<OccurrenceError.OccurrenceNotFound>(result.value)
    }

    @Test
    fun `findByImportance returns occurrences`() {

        val user = createUser("u", "u@mail")

        occurrenceService.createOccurrence(
            listOf(user.id),
            LocalDate.now().plusDays(3),
            OccurrenceType.URGENT
        )

        val result = occurrenceService.findByImportance(OccurrenceType.URGENT)

        assertTrue(result.isNotEmpty())
        assertEquals(OccurrenceType.URGENT, result.first().importance)
    }

    @Test
    fun `findOccurrenceByReporterId returns occurrences`() {

        val user = createUser("u", "u@mail")

        occurrenceService.createOccurrence(
            listOf(user.id),
            LocalDate.now().plusDays(3)
        )

        val result = occurrenceService.findOccurrenceByReporterId(user.id)

        assertEquals(1, result.size)
        assertEquals(user.id, result.first().reporterId.first())
    }

    @Test
    fun `findOccurrenceByReporterId returns empty list when none`() {

        val result = occurrenceService.findOccurrenceByReporterId(999)

        assertTrue(result.isEmpty())
    }

    @Test
    fun `findAll returns all occurrences`() {

        val user1 = createUser("u1", "u1@mail")
        val user2 = createUser("u2", "u2@mail")

        occurrenceService.createOccurrence(
            listOf(user1.id),
            LocalDate.now().plusDays(3)
        )

        occurrenceService.createOccurrence(
            listOf(user2.id),
            LocalDate.now().plusDays(4)
        )

        val result = occurrenceService.findAll()

        assertEquals(2, result.size)
    }

    @Test
    fun `findAll returns empty list when none`() {

        val result = occurrenceService.findAll()

        assertTrue(result.isEmpty())
    }

    @Test
    fun `deleteById removes occurrence`() {
        val user = createUser("u", "u@mail")

        val created =
            occurrenceService.createOccurrence(
                usersId = listOf(user.id),
                endDate = LocalDate.now().plusDays(3),
                importance = OccurrenceType.NORMAL
            ).let {
                check(it is Success)
                it.value
            }

        val result = occurrenceService.deleteById(created.id)

        assertIs<Success<Boolean>>(result)
        assertTrue(result.value)

        val find = occurrenceService.findById(created.id)
        assertIs<Either.Left<*>>(find)
        assertIs<OccurrenceError.OccurrenceNotFound>(find.value)
    }


    @Test
    fun `deleteById fails if not found`() {
        val result = occurrenceService.deleteById(999)

        assertIs<Either.Left<*>>(result)
        assertIs<OccurrenceError.OccurrenceNotFound>(result.value)
    }
}