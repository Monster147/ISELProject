package pt.ira

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import pt.ira.interfaces.TransactionManager
import pt.ira.model.report.CreateReportInput
import pt.ira.report.Report
import pt.ira.report.ReportStatus
import pt.ira.user.PasswordValidationInfo
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertIs
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

@SpringJUnitConfig(TestConfig::class)
class ReportControllerTest {
    @Autowired
    private lateinit var controller: ReportController

    @Autowired
    private lateinit var trxManager: TransactionManager

    private val mapper = ObjectMapper()

    @BeforeEach
    fun cleanup() {
        trxManager.run {
            repoReport.clear()
            repoUsers.clear()
            repoIntervenor.clear()
        }
    }

    @Test
    fun `create report success`() {
        val userId = createUser()

        val input = createReportInput(userId)

        val resp = controller.createReport(input)

        assertEquals(HttpStatus.CREATED, resp.statusCode)
        assertNotNull(resp.headers.getFirst(HttpHeaders.LOCATION))
    }

    @Test
    fun `create report with invalid user returns 404`() {
        val input = createReportInput(999)

        val resp = controller.createReport(input)

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `find report by id success`() {
        val reportId = createReport()

        val resp = controller.findReportById(reportId)

        assertEquals(HttpStatus.OK, resp.statusCode)
        assertIs<Report>(resp.body)
    }

    @Test
    fun `find report by id not found`() {
        val resp = controller.findReportById(999)

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `find all reports`() {
        createReport()
        createReport()

        val resp = controller.findAllReports()

        assertEquals(HttpStatus.OK, resp.statusCode)

        val body = resp.body as List<*>
        assertEquals(2, body.size)
    }

    @Test
    fun `find by status`() {
        val reportId = createReport()

        controller.updateReportStatus(reportId, "APPROVED")

        val resp = controller.findByStatus("APPROVED")

        assertEquals(1, resp.body.size)
    }

    @Test
    fun `find by creator`() {
        val userId = createUser()
        createReport(userId)

        val resp = controller.findByCreator(userId)

        assertEquals(1, resp.body.size)
    }

    @Test
    fun `delete report success`() {
        val reportId = createReport()

        val resp = controller.deleteReportById(reportId)

        assertEquals(HttpStatus.NO_CONTENT, resp.statusCode)
    }

    @Test
    fun `delete report not found`() {
        val resp = controller.deleteReportById(999)

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `update report status`() {
        val reportId = createReport()

        val resp = controller.updateReportStatus(reportId, "APPROVED")

        assertEquals(HttpStatus.OK, resp.statusCode)

        val body = resp.body as Report
        assertEquals(ReportStatus.APPROVED, body.status)
    }

    @Test
    fun `update report status not found`() {
        val resp = controller.updateReportStatus(999, "APPROVED")

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `add editor success`() {
        val reportId = createReport()
        val userId = createUser()

        val resp = controller.addEditor(reportId, userId)

        assertEquals(HttpStatus.OK, resp.statusCode)

        val body = resp.body as Report
        assertTrue(body.editors.contains(userId))
    }

    @Test
    fun `add editor report not found`() {
        val userId = createUser()

        val resp = controller.addEditor(999, userId)

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `add editor user not found`() {
        val reportId = createReport()

        val resp = controller.addEditor(reportId, 999)

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `remove editor success`() {
        val reportId = createReport()
        val userId = createUser()

        controller.addEditor(reportId, userId)

        val resp = controller.removeEditor(reportId, userId)

        assertEquals(HttpStatus.OK, resp.statusCode)

        val body = resp.body as Report
        assertFalse(body.editors.contains(userId))
    }

    @Test
    fun `add intervenor success`() {
        val reportId = createReport()
        val intervenorId = createIntervenor()

        val resp = controller.addIntervenor(reportId, intervenorId)

        assertEquals(HttpStatus.OK, resp.statusCode)

        val body = resp.body as Report
        assertTrue(body.intervenors.contains(intervenorId))
    }

    @Test
    fun `add intervenor report not found`() {
        val intervenorId = createIntervenor()

        val resp = controller.addIntervenor(999, intervenorId)

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `add intervenor not found`() {
        val reportId = createReport()

        val resp = controller.addIntervenor(reportId, 999)

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `remove intervenor success`() {
        val reportId = createReport()
        val intervenorId = createIntervenor()

        controller.addIntervenor(reportId, intervenorId)

        val resp = controller.removeIntervenor(reportId, intervenorId)

        assertEquals(HttpStatus.OK, resp.statusCode)

        val body = resp.body as Report
        assertFalse(body.intervenors.contains(intervenorId))
    }

    private fun createUser(): Int =
        trxManager.run {
            repoUsers.createUser("user", "u@mail.com", PasswordValidationInfo("123")).id
        }

    private fun createIntervenor(): Int =
        trxManager.run {
            repoIntervenor.createIntervenor(
                "123", "CC", "name", "contact", "addr"
            ).id
        }

    private fun createReport(creatorId: Int = createUser()): Int =
        controller.createReport(createReportInput(creatorId)).let { resp ->
            val location = requireNotNull(resp.headers.getFirst(HttpHeaders.LOCATION))
            location.substringAfterLast("/").toInt()
        }

    private fun createReportInput(userId: Int) =
        CreateReportInput(
            creatorId = userId,
            title = "title",
            description = "desc",
            type = mapper.readTree("""{"t":"a"}"""),
            addons = mapper.readTree("""{"a":"b"}""")
        )
}