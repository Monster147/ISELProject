package pt.ira

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import pt.ira.interfaces.TransactionManager
import pt.ira.occurrence.OccurrenceType
import pt.ira.user.PasswordValidationInfo
import java.time.LocalDate
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertTrue

@SpringJUnitConfig(TestConfig::class)
class OccurrenceServiceTest {
    private val objectMapper = ObjectMapper()

    private fun json(v: String) = objectMapper.readTree(v)

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
            repoType.clear()
        }
    }

    private fun createUser(
        name: String,
        email: String,
    ) = trxManager.run {
        repoUsers.createUser(
            name,
            email,
            PasswordValidationInfo("hash"),
            listOf(1),
        )
    }

    private fun createType(): Int =
        trxManager.run {
            repoType.createType("type", json("""{"field": "value"}""")).id
        }

    @Test
    fun `createOccurrence creates occurrence successfully`() {
        val user = createUser("u", "u@mail")
        val typeId = createType()

        val occurrence =
            occurrenceService.createOccurrence(
                usersId = user.id,
                endDate = LocalDate.now().plusDays(5),
                importance = OccurrenceType.CRITICAL,
                occurrenceType = typeId,
                occurrenceInfo = json("""{}"""),
            ).let {
                check(it is Success)
                it.value
            }

        assertEquals(user.id, occurrence.reporterId)
        assertEquals(OccurrenceType.CRITICAL, occurrence.importance)
    }

    @Test
    fun `createOccurrence fails when endDate is in the past`() {
        val user = createUser("u", "u@mail")
        val typeId = createType()

        val result =
            occurrenceService.createOccurrence(
                usersId = user.id,
                endDate = LocalDate.now().minusDays(1),
                importance = OccurrenceType.NORMAL,
                occurrenceType = typeId,
                occurrenceInfo = json("""{}"""),
            )

        assertIs<Either.Left<*>>(result)
        assertIs<OccurrenceError.EndDateNotValid>(result.value)
    }

    @Test
    fun `createOccurrence fails when user does not exist`() {
        val typeId = createType()

        val result =
            occurrenceService.createOccurrence(
                usersId = 999,
                endDate = LocalDate.now().plusDays(3),
                occurrenceType = typeId,
                occurrenceInfo = json("""{}"""),
            )

        assertIs<Either.Left<*>>(result)
        assertIs<OccurrenceError.UserNotFound>(result.value)
    }

    @Test
    fun `findById returns occurrence`() {
        val user = createUser("u", "u@mail")
        val typeId = createType()

        val created =
            occurrenceService.createOccurrence(
                usersId = user.id,
                endDate = LocalDate.now().plusDays(3),
                occurrenceType = typeId,
                occurrenceInfo = json("""{}"""),
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
        val typeId = createType()

        occurrenceService.createOccurrence(
            usersId = user.id,
            endDate = LocalDate.now().plusDays(3),
            importance = OccurrenceType.URGENT,
            occurrenceType = typeId,
            occurrenceInfo = json("""{}"""),
        )

        val result = occurrenceService.findByImportance(OccurrenceType.URGENT)

        assertTrue(result.isNotEmpty())
        assertEquals(OccurrenceType.URGENT, result.first().importance)
    }

    @Test
    fun `findOccurrenceByReporterId returns occurrences`() {
        val user = createUser("u", "u@mail")
        val typeId = createType()

        occurrenceService.createOccurrence(
            usersId = user.id,
            endDate = LocalDate.now().plusDays(3),
            occurrenceType = typeId,
            occurrenceInfo = json("""{}"""),
        )

        val result = occurrenceService.findOccurrenceByReporterId(user.id)

        assertEquals(1, result.size)
        assertEquals(user.id, result.first().reporterId)
    }

    @Test
    fun `findOccurrenceByReporterId returns empty list when none`() {
        val result = occurrenceService.findOccurrenceByReporterId(999)

        assertTrue(result.isEmpty())
    }

    @Test
    fun `findByIntervenor returns reports for intervenor`() {
        val intervenor =
            trxManager.run {
                repoIntervenor.createIntervenor("123", "CC", "name", "contact", "addr")
            }

        val user =
            trxManager.run {
                repoUsers.createUser("u", "u@mail", PasswordValidationInfo("x"), listOf(1))
            }

        val typeId = createType()

        val occurrence =
            occurrenceService.createOccurrence(
                usersId = user.id,
                endDate = LocalDate.now().plusDays(3),
                occurrenceType = typeId,
                occurrenceInfo = json("""{}"""),
            ).let {
                check(it is Success)
                it.value
            }

        occurrenceService.addIntervenor(occurrence.id, intervenor.id)

        val result = occurrenceService.findByIntervenor(intervenor)

        assertEquals(1, result.size)
        assertEquals(occurrence.id, result.first().id)
    }

    @Test
    fun `addIntervenor adds intervenor`() {
        val user =
            trxManager.run {
                repoUsers.createUser("u", "u@mail", PasswordValidationInfo("x"), listOf(1))
            }

        val intervenor =
            trxManager.run {
                repoIntervenor.createIntervenor("123", "CC", "name", "contact", "addr")
            }

        val typeId = createType()

        val occurrence =
            occurrenceService.createOccurrence(
                usersId = user.id,
                endDate = LocalDate.now().plusDays(3),
                occurrenceType = typeId,
                occurrenceInfo = json("""{}"""),
            ).let {
                check(it is Success)
                it.value
            }

        val updated =
            occurrenceService.addIntervenor(occurrence.id, intervenor.id)
                .let {
                    check(it is Success)
                    it.value
                }

        assertTrue(updated.intervenors.contains(intervenor.id))
    }

    @Test
    fun `addIntervenor fails if not found`() {
        val user =
            trxManager.run {
                repoUsers.createUser("u", "u@mail", PasswordValidationInfo("x"), listOf(1))
            }

        val typeId = createType()

        val occurrence =
            occurrenceService.createOccurrence(
                usersId = user.id,
                endDate = LocalDate.now().plusDays(3),
                occurrenceType = typeId,
                occurrenceInfo = json("""{}"""),
            ).let {
                check(it is Success)
                it.value
            }

        val result = occurrenceService.addIntervenor(occurrence.id, 999)

        assertIs<Either.Left<*>>(result)
        assertIs<OccurrenceError.IntervenorNotFound>(result.value)
    }

    @Test
    fun `removeIntervenor removes intervenor from report`() {
        val intervenor =
            trxManager.run {
                repoIntervenor.createIntervenor("123", "CC", "name", "contact", "addr")
            }

        val user =
            trxManager.run {
                repoUsers.createUser("u", "u@mail", PasswordValidationInfo("x"), listOf(1))
            }

        val typeId = createType()

        val occurrence =
            occurrenceService.createOccurrence(
                usersId = user.id,
                endDate = LocalDate.now().plusDays(3),
                occurrenceType = typeId,
                occurrenceInfo = json("""{}"""),
            ).let {
                check(it is Success)
                it.value
            }

        occurrenceService.addIntervenor(occurrence.id, intervenor.id)

        val updated =
            occurrenceService.removeIntervenor(occurrence.id, intervenor.id)
                .let {
                    check(it is Success)
                    it.value
                }

        assertTrue(!updated.intervenors.contains(intervenor.id))
    }

    @Test
    fun `removeIntervenor fails if report not found`() {
        val result = occurrenceService.removeIntervenor(999, 1)

        assertIs<Either.Left<*>>(result)
        assertIs<OccurrenceError.OccurrenceNotFound>(result.value)
    }

    @Test
    fun `removeIntervenor fails if intervenor not found`() {
        val user =
            trxManager.run {
                repoUsers.createUser("u", "u@mail", PasswordValidationInfo("x"), listOf(1))
            }

        val typeId = createType()

        val occurrence =
            occurrenceService.createOccurrence(
                usersId = user.id,
                endDate = LocalDate.now().plusDays(3),
                occurrenceType = typeId,
                occurrenceInfo = json("""{}"""),
            ).let {
                check(it is Success)
                it.value
            }

        val result = occurrenceService.removeIntervenor(occurrence.id, 999)

        assertIs<Either.Left<*>>(result)
        assertIs<OccurrenceError.IntervenorNotFound>(result.value)
    }

    @Test
    fun `findAll returns all occurrences`() {
        val user1 = createUser("u1", "u1@mail")
        val user2 = createUser("u2", "u2@mail")
        val typeId = createType()

        occurrenceService.createOccurrence(
            usersId = user1.id,
            endDate = LocalDate.now().plusDays(3),
            occurrenceType = typeId,
            occurrenceInfo = json("""{}"""),
        )

        occurrenceService.createOccurrence(
            usersId = user2.id,
            endDate = LocalDate.now().plusDays(4),
            occurrenceType = typeId,
            occurrenceInfo = json("""{}"""),
        )

        val result =
            occurrenceService.findAll().let {
                check(it is Success)
                it.value
            }

        assertEquals(2, result.size)
    }

    @Test
    fun `findAll returns empty list when none`() {
        val result =
            occurrenceService.findAll().let {
                check(it is Success)
                it.value
            }

        assertTrue(result.isEmpty())
    }

    @Test
    fun `deleteById removes occurrence`() {
        val user = createUser("u", "u@mail")
        val typeId = createType()

        val created =
            occurrenceService.createOccurrence(
                usersId = user.id,
                endDate = LocalDate.now().plusDays(3),
                importance = OccurrenceType.NORMAL,
                occurrenceType = typeId,
                occurrenceInfo = json("""{}"""),
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
