package pt.ira

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import pt.ira.interfaces.TransactionManager
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
        }
    }

    @Test
    fun `createReport creates report`() {
        val report = reportService.createReport(
            creatorId = 1,
            title = "title",
            description = "desc",
            type = json("""{"t":"a"}"""),
            addons = json("""{}""")
        ).let {
            check(it is Success)
            it.value
        }

        assertEquals("title", report.title)
        assertEquals(1, report.creatorId)
    }

    @Test
    fun `findById returns report`() {
        val created = reportService.createReport(
            1, "t", "d", json("""{}"""), json("""{}""")
        ).let {
            check(it is Success)
            it.value
        }

        val found = reportService.findById(created.id).let {
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
        reportService.createReport(10, "t1", "d", json("""{}"""), json("""{}"""))
        reportService.createReport(10, "t2", "d", json("""{}"""), json("""{}"""))

        val result = reportService.findByCreatorId(10)

        assertEquals(2, result.size)
    }

    @Test
    fun `findAll returns reports`() {
        reportService.createReport(1, "t1", "d", json("""{}"""), json("""{}"""))
        reportService.createReport(2, "t2", "d", json("""{}"""), json("""{}"""))

        val result = reportService.findAll()

        assertEquals(2, result.size)
    }

    @Test
    fun `addEditor adds editor to report`() {
        val user = trxManager.run {
            repoUsers.createUser("u", "u@mail", PasswordValidationInfo("x"), listOf(1))
        }

        val report = reportService.createReport(
            user.id, "t", "d", json("""{}"""), json("""{}""")
        ).let {
            check(it is Success)
            it.value
        }

        val updated = reportService.addEditor(report.id, user.id).let {
            check(it is Success)
            it.value
        }

        assertTrue(updated.editors.contains(user.id))
    }

    @Test
    fun `addEditor fails if user not found`() {
        val report = reportService.createReport(
            1, "t", "d", json("""{}"""), json("""{}""")
        ).let {
            check(it is Success)
            it.value
        }

        val result = reportService.addEditor(report.id, 999)

        assertIs<Either.Left<*>>(result)
        assertIs<ReportError.UserNotFound>(result.value)
    }

    @Test
    fun `updateStatus updates report status`() {
        val report = reportService.createReport(
            1, "t", "d", json("""{}"""), json("""{}""")
        ).let {
            check(it is Success)
            it.value
        }

        val updated = reportService.updateStatus(report.id, ReportStatus.SUBMITED).let {
            check(it is Success)
            it.value
        }

        assertEquals(ReportStatus.SUBMITED, updated.status)
    }

    @Test
    fun `addIntervenor adds intervenor`() {
        val intervenor = trxManager.run {
            repoIntervenor.createIntervenor("123", "CC", "name", "contact", "addr")
        }

        val report = reportService.createReport(
            1, "t", "d", json("""{}"""), json("""{}""")
        ).let {
            check(it is Success)
            it.value
        }

        val updated = reportService.addIntervenor(report.id, intervenor.id).let {
            check(it is Success)
            it.value
        }

        assertTrue(updated.intervenors.contains(intervenor.id))
    }

    @Test
    fun `addIntervenor fails if not found`() {
        val report = reportService.createReport(
            1, "t", "d", json("""{}"""), json("""{}""")
        ).let {
            check(it is Success)
            it.value
        }

        val result = reportService.addIntervenor(report.id, 999)

        assertIs<Either.Left<*>>(result)
        assertIs<ReportError.IntervenorNotFound>(result.value)
    }

    @Test
    fun `deleteById removes report`() {
        val created = reportService.createReport(
            1, "t", "d", json("""{}"""), json("""{}""")
        ).let {
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