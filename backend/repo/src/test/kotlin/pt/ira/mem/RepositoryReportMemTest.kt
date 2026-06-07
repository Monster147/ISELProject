package pt.ira.mem

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import pt.ira.interfaces.RepositoryReport
import pt.ira.report.ReportStatus
import pt.ira.user.PasswordValidationInfo
import pt.ira.user.User
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull

class RepositoryReportMemTest {
    private lateinit var repo: RepositoryReport
    private val mapper = ObjectMapper()

    private fun json(str: String) = mapper.readTree(str)

    @BeforeEach
    fun setup() {
        repo = RepositoryReportMem()
    }

    @Test
    fun `createReport and findById`() {
        val report =
            repo.createReport(
                1,
                1,
                "Title",
                "Desc",
                1,
                json("""{"extra":true}"""),
                emptyList(),
                language = "en",
            )

        val found = repo.findById(report.id)

        assertEquals(report, found)
    }

    @Test
    fun `findAll returns all reports`() {
        val r1 = repo.createReport(1, 1, "R1", "D1", 1, json("""{}"""), emptyList(), language = "en")
        val r2 = repo.createReport(2, 2, "R2", "D2", 1, json("""{}"""), emptyList(), language = "en")

        val all = repo.findAll()

        assertEquals(2, all.size)
        assertEquals(listOf(r1, r2), all)
    }

    @Test
    fun `findByStatus returns correct reports`() {
        val r1 = repo.createReport(1, 1, "R1", "D1", 1, json("""{}"""), emptyList(), language = "en")
        repo.createReport(1, 2, "R2", "D2", 1, json("""{}"""), emptyList(), language = "en")

        repo.updateStatus(r1, ReportStatus.APPROVED)

        val approved = repo.findByStatus(ReportStatus.APPROVED)

        assertEquals(listOf(repo.findById(r1.id)), approved)
    }

    @Test
    fun `addEditor adds editor correctly`() {
        val report = repo.createReport(1, 1, "R", "D", 1, json("""{}"""), emptyList(), language = "en")
        val user = User(1, "User", "user@mail.com", PasswordValidationInfo("hash"), listOf(1))

        val updatedReport = repo.addEditor(report, user)
        val updatedFromRepo = repo.findById(report.id)

        assertNotNull(updatedFromRepo)
        assertTrue(updatedFromRepo.editors.contains(user.id))
        assertEquals(updatedReport, updatedFromRepo)
    }

    @Test
    fun `addEditor does not duplicate editor`() {
        val report = repo.createReport(1, 1, "R", "D", 1, json("""{}"""), emptyList(), language = "en")
        val user = User(1, "User", "user@mail.com", PasswordValidationInfo("hash"), listOf(1))

        val once = repo.addEditor(report, user)
        val twice = repo.addEditor(once, user)

        assertEquals(1, twice.editors.count { it == user.id })
    }

    @Test
    fun `removeEditor removes editor`() {
        val creatorId = 1
        val report = repo.createReport(creatorId, 1, "R", "D", 1, json("""{}"""), emptyList(), language = "en")

        // editor diferente do creator, senão nunca iria ser removido do "resto"
        val editor = User(2, "User", "user@mail.com", PasswordValidationInfo("hash"), listOf(1))

        val withEditor = repo.addEditor(report, editor)
        val removed = repo.removeEditor(withEditor, editor)

        val updated = repo.findById(report.id)

        assertNotNull(updated)
        assertTrue(updated.editors.contains(creatorId)) // creator continua editor
        assertTrue(!updated.editors.contains(editor.id)) // editor removido
        assertEquals(removed, updated)
    }

    @Test
    fun `removeEditor does nothing if editor not present`() {
        val report = repo.createReport(1, 1, "R", "D", 1, json("""{}"""), emptyList(), language = "en")
        val user = User(1, "User", "user@mail.com", PasswordValidationInfo("hash"), listOf(1))
        val user2 = User(2, "User2", "user2@mail.com", PasswordValidationInfo("hash"), listOf(1))

        val removed = repo.removeEditor(report, user2)

        val updated = repo.findById(report.id)

        assertNotNull(updated)
        assertEquals(report, removed)
        assertEquals(report, updated)
    }

    @Test
    fun `updateStatus changes report status`() {
        val report = repo.createReport(1, 1, "R", "D", 1, json("""{}"""), emptyList(), language = "en")

        val updatedReport = repo.updateStatus(report, ReportStatus.APPROVED)
        val updatedFromRepo = repo.findById(report.id)

        assertNotNull(updatedFromRepo)
        assertEquals(ReportStatus.APPROVED, updatedFromRepo.status)
        assertEquals(updatedReport, updatedFromRepo)
    }

    @Test
    fun `findByCreatorId returns correct reports`() {
        val r1 = repo.createReport(1, 1, "R1", "D1", 1, json("""{}"""), emptyList(), language = "en")
        repo.createReport(2, 2, "R2", "D2", 1, json("""{}"""), emptyList(), language = "en")

        val result = repo.findByCreatorId(1)

        assertEquals(listOf(r1), result)
    }

    @Test
    fun `findByType returns correct reports`() {
        val typeA = 1

        val r1 = repo.createReport(1, 1, "R1", "D1", typeA, json("""{}"""), emptyList(), language = "en")

        val result = repo.findByType(typeA)

        assertEquals(listOf(r1), result)
    }

    @Test
    fun `deleteById removes report`() {
        val report = repo.createReport(1, 1, "R", "D", 1, json("""{}"""), emptyList(), language = "en")

        repo.deleteById(report.id)
        val found = repo.findById(report.id)

        assertNull(found)
    }

    @Test
    fun `save updates existing report`() {
        val report = repo.createReport(1, 1, "R", "D", 1, json("""{}"""), emptyList(), language = "en")

        val updated = report.copy(title = "Updated")
        repo.save(updated)

        val found = repo.findById(report.id)

        assertNotNull(found)
        assertEquals("Updated", found.title)
    }

    @Test
    fun `clear removes all reports`() {
        repo.createReport(1, 1, "R1", "D1", 1, json("""{}"""), emptyList(), language = "en")
        repo.createReport(2, 2, "R2", "D2", 1, json("""{}"""), emptyList(), language = "en")

        repo.clear()

        assertTrue(repo.findAll().isEmpty())
    }

    @Test
    fun `findByOccurrenceId returns report for occurrence`() {
        val r1 = repo.createReport(1, 1, "R1", "D1", 1, json("""{}"""), emptyList(), language = "en")

        repo.createReport(1, 2, "R1", "D1", 1, json("""{}"""), emptyList(), language = "en")

        val found = repo.findByOccurrenceId(1)

        assertNotNull(found)
        assertEquals(r1, found)
    }

    @Test
    fun `findByOccurrenceId returns null when no report exists for occurrence`() {
        val found = repo.findByOccurrenceId(999)
        assertNull(found)
    }
}
