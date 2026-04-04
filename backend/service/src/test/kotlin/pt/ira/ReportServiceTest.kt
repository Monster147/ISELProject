package pt.ira

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import pt.ira.interfaces.TransactionManager
import pt.ira.occurrence.OccurrenceType
import pt.ira.report.ReportStatus
import pt.ira.user.PasswordValidationInfo
import java.time.LocalDate
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertTrue

@SpringJUnitConfig(TestConfig::class)
class ReportServiceTest {
    @Autowired
    private lateinit var reportService: ReportService

    @Autowired
    private lateinit var trxManager: TransactionManager

    private val objectMapper = ObjectMapper()

    private fun json(v: String) = objectMapper.readTree(v)

    @BeforeEach
    fun reset() {
        trxManager.run {
            repoReport.clear()
            repoUsers.clear()
            repoIntervenor.clear()
            repoOccurrence.clear()
        }
    }

    private fun createOccurrenceForUser(userId: Int) =
        trxManager.run {
            repoOccurrence.createOccurrence(
                endDate = LocalDate.of(2030, 3, 30),
                reporterId = userId,
                importance = OccurrenceType.NORMAL,
                occurrenceType = json("""{"type":"base"}"""),
                occurrenceInfo = json("""{}"""),
            )
        }

    @Test
    fun `createReport creates report`() {
        val user =
            trxManager.run {
                repoUsers.createUser("u", "u@mail", PasswordValidationInfo("x"), listOf(1))
            }

        val occurrence = createOccurrenceForUser(user.id)

        val report =
            reportService.createReport(
                user.id,
                occurrence.id,
                "title",
                "desc",
                json("""{}"""),
            ).let {
                check(it is Success)
                it.value
            }

        assertEquals("title", report.title)
        assertEquals(user.id, report.creatorId)
        assertEquals(occurrence.occurrenceType, report.type)
    }

    @Test
    fun `findById returns report`() {
        val user =
            trxManager.run {
                repoUsers.createUser("u", "u@mail", PasswordValidationInfo("x"), listOf(1))
            }

        val occurrence = createOccurrenceForUser(user.id)

        val created =
            reportService.createReport(
                user.id,
                occurrence.id,
                "t",
                "d",
                json("""{}"""),
            ).let {
                check(it is Success)
                it.value
            }

        val found =
            reportService.findById(created.id).let {
                check(it is Success)
                it.value
            }

        assertEquals(created.id, found.id)
    }

    @Test
    fun `findById fails if not found`() {
        val result = reportService.findById(999)

        assertIs<Either.Left<*>>(result)
        assertIs<ReportError.ReportNotFound>(result.value)
    }

    @Test
    fun `findByCreatorId returns reports`() {
        val user =
            trxManager.run {
                repoUsers.createUser("u", "u@mail", PasswordValidationInfo("x"), listOf(1))
            }

        val occurrence1 = createOccurrenceForUser(user.id)
        val occurrence2 = createOccurrenceForUser(user.id)

        reportService.createReport(user.id, occurrence1.id, "t1", "d", json("""{}"""))
        reportService.createReport(user.id, occurrence2.id, "t2", "d", json("""{}"""))

        val result = reportService.findByCreatorId(user.id)

        assertEquals(2, result.size)
    }

    @Test
    fun `findAll returns reports`() {
        val user1 =
            trxManager.run {
                repoUsers.createUser("u1", "u1@mail", PasswordValidationInfo("x"), listOf(1))
            }

        val user2 =
            trxManager.run {
                repoUsers.createUser("u2", "u2@mail", PasswordValidationInfo("x"), listOf(1))
            }

        val occurrence1 = createOccurrenceForUser(user1.id)
        val occurrence2 = createOccurrenceForUser(user2.id)

        reportService.createReport(user1.id, occurrence1.id, "t1", "d", json("""{}"""))
        reportService.createReport(user2.id, occurrence2.id, "t2", "d", json("""{}"""))

        val result = reportService.findAll()

        assertEquals(2, result.size)
    }

    @Test
    fun `findByStatus returns reports with given status`() {
        val user1 =
            trxManager.run {
                repoUsers.createUser("u1", "u1@mail", PasswordValidationInfo("x"), listOf(1))
            }

        val user2 =
            trxManager.run {
                repoUsers.createUser("u2", "u2@mail", PasswordValidationInfo("x"), listOf(1))
            }

        val occurrence1 = createOccurrenceForUser(user1.id)
        val occurrence2 = createOccurrenceForUser(user2.id)

        val r1 =
            reportService.createReport(user1.id, occurrence1.id, "t1", "d", json("""{}"""))
                .let {
                    check(it is Success)
                    it.value
                }

        val r2 =
            reportService.createReport(user2.id, occurrence2.id, "t2", "d", json("""{}"""))
                .let {
                    check(it is Success)
                    it.value
                }

        reportService.updateStatus(r1.id, ReportStatus.SUBMITED)
        reportService.updateStatus(r2.id, ReportStatus.EDITING)

        val result = reportService.findByStatus(ReportStatus.SUBMITED)

        assertEquals(1, result.size)
        assertEquals(r1.id, result.first().id)
    }

    @Test
    fun `findByEditor returns reports for editor`() {
        val user =
            trxManager.run {
                repoUsers.createUser("u", "u@mail", PasswordValidationInfo("x"), listOf(1))
            }

        val occurrence1 = createOccurrenceForUser(user.id)
        val occurrence2 = createOccurrenceForUser(user.id)

        val r1 =
            reportService.createReport(user.id, occurrence1.id, "t1", "d", json("""{}"""))
                .let {
                    check(it is Success)
                    it.value
                }

        reportService.createReport(user.id, occurrence2.id, "t2", "d", json("""{}"""))

        reportService.addEditor(r1.id, user.id)

        val result = reportService.findByEditor(user.id)

        assertEquals(1, result.size)
        assertEquals(r1.id, result.first().id)
    }

    @Test
    fun `findByType returns reports with matching type`() {
        val user1 =
            trxManager.run {
                repoUsers.createUser("u1", "u1@mail", PasswordValidationInfo("x"), listOf(1))
            }

        val user2 =
            trxManager.run {
                repoUsers.createUser("u2", "u2@mail", PasswordValidationInfo("x"), listOf(1))
            }

        val occurrence1 = createOccurrenceForUser(user1.id)
        val occurrence2 = createOccurrenceForUser(user2.id)

        val r1 =
            reportService.createReport(user1.id, occurrence1.id, "t1", "d", json("""{}"""))
                .let {
                    check(it is Success)
                    it.value
                }

        reportService.createReport(user2.id, occurrence2.id, "t2", "d", json("""{}"""))

        val result = reportService.findByType(json("""{"type":"base"}"""))

        assertTrue(result.any { it.id == r1.id })
        assertTrue(result.any { it.title == "t1" })
    }

    @Test
    fun `addEditor adds editor to report`() {
        val user =
            trxManager.run {
                repoUsers.createUser("u", "u@mail", PasswordValidationInfo("x"), listOf(1))
            }

        val occurrence = createOccurrenceForUser(user.id)

        val report =
            reportService.createReport(user.id, occurrence.id, "t", "d", json("""{}"""))
                .let {
                    check(it is Success)
                    it.value
                }

        val updated =
            reportService.addEditor(report.id, user.id)
                .let {
                    check(it is Success)
                    it.value
                }

        assertTrue(updated.editors.contains(user.id))
    }

    @Test
    fun `addEditor fails if user not found`() {
        val user =
            trxManager.run {
                repoUsers.createUser("u", "u@mail", PasswordValidationInfo("x"), listOf(1))
            }

        val occurrence = createOccurrenceForUser(user.id)

        val report =
            reportService.createReport(user.id, occurrence.id, "t", "d", json("""{}"""))
                .let {
                    check(it is Success)
                    it.value
                }

        val result = reportService.addEditor(report.id, 999)

        assertIs<Either.Left<*>>(result)
        assertIs<ReportError.UserNotFound>(result.value)
    }

    @Test
    fun `removeEditor removes editor from report`() {
        val user =
            trxManager.run {
                repoUsers.createUser("u", "u@mail", PasswordValidationInfo("x"), listOf(1))
            }

        val occurrence = createOccurrenceForUser(user.id)

        val report =
            reportService.createReport(user.id, occurrence.id, "t", "d", json("""{}"""))
                .let {
                    check(it is Success)
                    it.value
                }

        reportService.addEditor(report.id, user.id)

        val updated =
            reportService.removeEditor(report.id, user.id)
                .let {
                    check(it is Success)
                    it.value
                }

        assertTrue(!updated.editors.contains(user.id))
    }

    @Test
    fun `removeEditor fails if report not found`() {
        val result = reportService.removeEditor(999, 1)

        assertIs<Either.Left<*>>(result)
        assertIs<ReportError.ReportNotFound>(result.value)
    }

    @Test
    fun `removeEditor fails if user not found`() {
        val user =
            trxManager.run {
                repoUsers.createUser("u", "u@mail", PasswordValidationInfo("x"), listOf(1))
            }

        val occurrence = createOccurrenceForUser(user.id)

        val report =
            reportService.createReport(user.id, occurrence.id, "t", "d", json("""{}"""))
                .let {
                    check(it is Success)
                    it.value
                }

        val result = reportService.removeEditor(report.id, 999)

        assertIs<Either.Left<*>>(result)
        assertIs<ReportError.UserNotFound>(result.value)
    }

    @Test
    fun `updateStatus updates report status`() {
        val user =
            trxManager.run {
                repoUsers.createUser("u", "u@mail", PasswordValidationInfo("x"), listOf(1))
            }

        val occurrence = createOccurrenceForUser(user.id)

        val report =
            reportService.createReport(user.id, occurrence.id, "t", "d", json("""{}"""))
                .let {
                    check(it is Success)
                    it.value
                }

        val updated =
            reportService.updateStatus(report.id, ReportStatus.SUBMITED)
                .let {
                    check(it is Success)
                    it.value
                }

        assertEquals(ReportStatus.SUBMITED, updated.status)
    }

    @Test
    fun `deleteById removes report`() {
        val user =
            trxManager.run {
                repoUsers.createUser("u", "u@mail", PasswordValidationInfo("x"), listOf(1))
            }

        val occurrence = createOccurrenceForUser(user.id)

        val created =
            reportService.createReport(user.id, occurrence.id, "t", "d", json("""{}"""))
                .let {
                    check(it is Success)
                    it.value
                }

        val result = reportService.deleteById(created.id)

        assertIs<Success<Boolean>>(result)
        assertTrue(result.value)

        val find = reportService.findById(created.id)

        assertIs<Either.Left<*>>(find)
        assertIs<ReportError.ReportNotFound>(find.value)
    }

    @Test
    fun `deleteById fails if not found`() {
        val result = reportService.deleteById(999)

        assertIs<Either.Left<*>>(result)
        assertIs<ReportError.ReportNotFound>(result.value)
    }
}
