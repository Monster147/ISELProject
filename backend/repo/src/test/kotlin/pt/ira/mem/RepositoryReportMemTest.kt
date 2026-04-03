package pt.ira.mem

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import pt.ira.interfaces.RepositoryReport
import pt.ira.intervenor.Intervenor
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
                json("""{"type":"A"}"""),
                json("""{"extra":true}"""),
            )

        val found = repo.findById(report.id)

        assertEquals(report, found)
    }

    @Test
    fun `findAll returns all reports`() {
        val r1 = repo.createReport(1, 1,"R1", "D1", json("""{"t":"1"}"""), json("""{}"""))
        val r2 = repo.createReport(2, 2,"R2", "D2", json("""{"t":"2"}"""), json("""{}"""))

        val all = repo.findAll()

        assertEquals(2, all.size)
        assertEquals(listOf(r1, r2), all)
    }

    @Test
    fun `findByStatus returns correct reports`() {
        val r1 = repo.createReport(1, 1,"R1", "D1", json("""{"t":"1"}"""), json("""{}"""))
        repo.createReport(1, 2,"R2", "D2", json("""{"t":"2"}"""), json("""{}"""))

        repo.updateStatus(r1, ReportStatus.APPROVED)

        val approved = repo.findByStatus(ReportStatus.APPROVED)

        assertEquals(listOf(repo.findById(r1.id)), approved)
    }

    @Test
    fun `addEditor adds editor correctly`() {
        val report = repo.createReport(1, 1,"R", "D", json("""{}"""), json("""{}"""))
        val user = User(1, "User", "user@mail.com", PasswordValidationInfo("hash"), listOf(1))

        val updatedReport = repo.addEditor(report, user)
        val updatedFromRepo = repo.findById(report.id)

        assertNotNull(updatedFromRepo)
        assertTrue(updatedFromRepo.editors.contains(user.id))
        assertEquals(updatedReport, updatedFromRepo)
    }

    @Test
    fun `addEditor does not duplicate editor`() {
        val report = repo.createReport(1, 1,"R", "D", json("""{}"""), json("""{}"""))
        val user = User(1, "User", "user@mail.com", PasswordValidationInfo("hash"), listOf(1))

        val once = repo.addEditor(report, user)
        val twice = repo.addEditor(once, user)

        assertEquals(1, twice.editors.count { it == user.id })
    }

    @Test
    fun `removeEditor removes editor`() {
        val report = repo.createReport(1, 1,"R", "D", json("""{}"""), json("""{}"""))
        val user = User(1, "User", "user@mail.com", PasswordValidationInfo("hash"), listOf(1))

        val withEditor = repo.addEditor(report, user)
        val removed = repo.removeEditor(withEditor, user)

        val updated = repo.findById(report.id)

        assertNotNull(updated)
        assertTrue(updated.editors.isEmpty())
        assertEquals(removed, updated)
    }

    @Test
    fun `removeEditor does nothing if editor not present`() {
        val report = repo.createReport(1, 1,"R", "D", json("""{}"""), json("""{}"""))
        val user = User(1, "User", "user@mail.com", PasswordValidationInfo("hash"), listOf(1))

        val removed = repo.removeEditor(report, user)

        val updated = repo.findById(report.id)

        assertNotNull(updated)
        assertEquals(report, removed)
        assertEquals(report, updated)
    }

    @Test
    fun `updateStatus changes report status`() {
        val report = repo.createReport(1, 1,"R", "D", json("""{}"""), json("""{}"""))

        val updatedReport = repo.updateStatus(report, ReportStatus.APPROVED)
        val updatedFromRepo = repo.findById(report.id)

        assertNotNull(updatedFromRepo)
        assertEquals(ReportStatus.APPROVED, updatedFromRepo.status)
        assertEquals(updatedReport, updatedFromRepo)
    }

    @Test
    fun `findByCreatorId returns correct reports`() {
        val r1 = repo.createReport(1, 1,"R1", "D1", json("""{}"""), json("""{}"""))
        repo.createReport(2, 2,"R2", "D2", json("""{}"""), json("""{}"""))

        val result = repo.findByCreatorId(1)

        assertEquals(listOf(r1), result)
    }

    @Test
    fun `findByType returns correct reports`() {
        val typeA = json("""{"type":"A"}""")

        val r1 = repo.createReport(1, 1,"R1", "D1", typeA, json("""{}"""))

        val result = repo.findByType(typeA)

        assertEquals(listOf(r1), result)
    }

    @Test
    fun `deleteById removes report`() {
        val report = repo.createReport(1, 1,"R", "D", json("""{}"""), json("""{}"""))

        repo.deleteById(report.id)
        val found = repo.findById(report.id)

        assertNull(found)
    }

    @Test
    fun `save updates existing report`() {
        val report = repo.createReport(1, 1,"R", "D", json("""{}"""), json("""{}"""))

        val updated = report.copy(title = "Updated")
        repo.save(updated)

        val found = repo.findById(report.id)

        assertNotNull(found)
        assertEquals("Updated", found.title)
    }

    @Test
    fun `clear removes all reports`() {
        repo.createReport(1, 1,"R1", "D1", json("""{}"""), json("""{}"""))
        repo.createReport(2, 2,"R2", "D2", json("""{}"""), json("""{}"""))

        repo.clear()

        assertTrue(repo.findAll().isEmpty())
    }

    @Test
    fun `addIntervenor adds intervenor correctly`() {
        val report = repo.createReport(1, 1,"R", "D", json("""{}"""), json("""{}"""))
        val intervenor = Intervenor(1, "159874598", "CC", "TestName", "958768396", "RUA TESTE")

        val updatedReport = repo.addIntervenor(report, intervenor)
        val updatedFromRepo = repo.findById(report.id)

        assertNotNull(updatedFromRepo)
        assertTrue(updatedFromRepo.intervenors.contains(intervenor.id))
        assertEquals(updatedReport, updatedFromRepo)
    }

    @Test
    fun `addIntervenor does not duplicate intervenor`() {
        val report = repo.createReport(1, 1,"R", "D", json("""{}"""), json("""{}"""))
        val intervenor = Intervenor(1, "159874598", "CC", "TestName", "958768396", "RUA TESTE")

        val once = repo.addIntervenor(report, intervenor)
        val twice = repo.addIntervenor(once, intervenor)

        assertEquals(1, twice.intervenors.count { it == intervenor.id })
    }

    @Test
    fun `removeIntervenor removes intervenor`() {
        val report = repo.createReport(1, 1,"R", "D", json("""{}"""), json("""{}"""))
        val intervenor = Intervenor(1, "159874598", "CC", "TestName", "958768396", "RUA TESTE")

        val withIntervenor = repo.addIntervenor(report, intervenor)
        val removed = repo.removeIntervenor(withIntervenor, intervenor)

        val updated = repo.findById(report.id)

        assertNotNull(updated)
        assertTrue(updated.intervenors.isEmpty())
        assertEquals(removed, updated)
    }

    @Test
    fun `removeIntervenor does nothing if not present`() {
        val report = repo.createReport(1, 1,"R", "D", json("""{}"""), json("""{}"""))
        val intervenor = Intervenor(1, "159874598", "CC", "TestName", "958768396", "RUA TESTE")

        val removed = repo.removeIntervenor(report, intervenor)
        val updated = repo.findById(report.id)

        assertNotNull(updated)
        assertEquals(report, removed)
        assertEquals(report, updated)
    }

    @Test
    fun `findByIntervenor returns correct reports`() {
        val intervenor = Intervenor(1, "159874598", "CC", "TestName", "958768396", "RUA TESTE")
        val r1 = repo.createReport(1, 1,"R1", "D1", json("""{}"""), json("""{}"""))

        repo.addIntervenor(r1, intervenor)

        val result = repo.findByIntervenor(intervenor)

        assertEquals(listOf(repo.findById(r1.id)), result)
    }
    @Test
    fun `findByOccurrenceId returns report for occurrence`() {
        val r1 =  repo.createReport(1, 1,"R1", "D1", json("""{}"""), json("""{}"""))

        repo.createReport(1, 2,"R1", "D1", json("""{}"""), json("""{}"""))

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
