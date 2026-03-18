package pt.ira.mem

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import pt.ira.Intervenor
import pt.ira.PasswordValidationInfo
import pt.ira.ReportStatus
import pt.ira.Role
import pt.ira.User
import pt.ira.interfaces.RepositoryReport
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

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
        val report = repo.createReport(
            1,
            "Title",
            "Desc",
            json("""{"type":"A"}"""),
            json("""{"extra":true}""")
        )

        val found = repo.findById(report.id)

        assertEquals(report, found)
    }

    @Test
    fun `findAll returns all reports`() {
        val r1 = repo.createReport(1, "R1", "D1", json("""{"t":"1"}"""), json("""{}"""))
        val r2 = repo.createReport(2, "R2", "D2", json("""{"t":"2"}"""), json("""{}"""))

        val all = repo.findAll()

        assertEquals(2, all.size)
        assertEquals(listOf(r1, r2), all)
    }

    @Test
    fun `findByStatus returns correct reports`() {
        val r1 = repo.createReport(1, "R1", "D1", json("""{"t":"1"}"""), json("""{}"""))
        val r2 = repo.createReport(1, "R2", "D2", json("""{"t":"2"}"""), json("""{}"""))

        repo.updateStatus(r1.id, ReportStatus.APPROVED)

        val approved = repo.findByStatus(ReportStatus.APPROVED)

        assertEquals(listOf(repo.findById(r1.id)), approved)
    }

    @Test
    fun `addEditor adds editor correctly`() {
        val report = repo.createReport(1, "R", "D", json("""{}"""), json("""{}"""))
        val user = User(1, "User", "user@mail.com", PasswordValidationInfo("hash"), listOf(Role.Admin))

        val result = repo.addEditor(report.id, user)

        val updated = repo.findById(report.id)

        assertTrue(result)
        assertNotNull(updated)
        assertTrue(updated.editors.contains(user))
    }

    @Test
    fun `addEditor does not duplicate editor`() {
        val report = repo.createReport(1, "R", "D", json("""{}"""), json("""{}"""))
        val user = User(1, "User", "user@mail.com", PasswordValidationInfo("hash"), listOf(Role.Admin))

        repo.addEditor(report.id, user)
        val result = repo.addEditor(report.id, user)

        assertFalse(result)
    }

    @Test
    fun `removeEditor removes editor`() {
        val report = repo.createReport(1, "R", "D", json("""{}"""), json("""{}"""))
        val user = User(1, "User", "user@mail.com", PasswordValidationInfo("hash"), listOf(Role.Admin))

        repo.addEditor(report.id, user)
        val removed = repo.removeEditor(report.id, user.id)

        val updated = repo.findById(report.id)

        assertTrue(removed)
        assertNotNull(updated)
        assertTrue(updated.editors.isEmpty())
    }

    @Test
    fun `updateStatus changes report status`() {
        val report = repo.createReport(1, "R", "D", json("""{}"""), json("""{}"""))

        val result = repo.updateStatus(report.id, ReportStatus.APPROVED)

        val updated = repo.findById(report.id)

        assertTrue(result)
        assertNotNull(updated)
        assertEquals(ReportStatus.APPROVED, updated.status)
    }

    @Test
    fun `findByCreatorId returns correct reports`() {
        val r1 = repo.createReport(1, "R1", "D1", json("""{}"""), json("""{}"""))
        val r2 = repo.createReport(2, "R2", "D2", json("""{}"""), json("""{}"""))

        val result = repo.findByCreatorId(1)

        assertEquals(listOf(r1), result)
    }

    @Test
    fun `findByType returns correct reports`() {
        val typeA = json("""{"type":"A"}""")
        val typeB = json("""{"type":"B"}""")

        val r1 = repo.createReport(1, "R1", "D1", typeA, json("""{}"""))
        repo.createReport(1, "R2", "D2", typeB, json("""{}"""))

        val result = repo.findByType(typeA)

        assertEquals(listOf(r1), result)
    }

    @Test
    fun `deleteById removes report`() {
        val report = repo.createReport(1, "R", "D", json("""{}"""), json("""{}"""))

        val deleted = repo.deleteById(report.id)
        val found = repo.findById(report.id)

        assertTrue(deleted)
        assertNull(found)
    }

    @Test
    fun `save updates existing report`() {
        val report = repo.createReport(1, "R", "D", json("""{}"""), json("""{}"""))

        val updated = report.copy(title = "Updated")

        repo.save(updated)

        val found = repo.findById(report.id)

        assertNotNull(found)
        assertEquals("Updated", found.title)
    }

    @Test
    fun `clear removes all reports`() {
        repo.createReport(1, "R1", "D1", json("""{}"""), json("""{}"""))
        repo.createReport(2, "R2", "D2", json("""{}"""), json("""{}"""))

        repo.clear()

        assertTrue(repo.findAll().isEmpty())
    }

    @Test
    fun `addIntervenor adds intervenor correctly`() {
        val report = repo.createReport(1, "R", "D", json("""{}"""), json("""{}"""))
        val intervenor = Intervenor(1, "159874598", "CC", "TestName", "958768396", "RUA TESTE")

        val result = repo.addIntervenor(report.id, intervenor)

        val updated = repo.findById(report.id)

        assertTrue(result)
        assertNotNull(updated)
        assertTrue(updated.intervenors.contains(intervenor))
    }

    @Test
    fun `addIntervenor does not duplicate intervenor`() {
        val report = repo.createReport(1, "R", "D", json("""{}"""), json("""{}"""))
        val intervenor = Intervenor(1, "159874598", "CC", "TestName", "958768396", "RUA TESTE")

        repo.addIntervenor(report.id, intervenor)
        val result = repo.addIntervenor(report.id, intervenor)

        assertFalse(result)
    }

    @Test
    fun `removeIntervenor removes intervenor`() {
        val report = repo.createReport(1, "R", "D", json("""{}"""), json("""{}"""))
        val intervenor = Intervenor(1, "159874598", "CC", "TestName", "958768396", "RUA TESTE")

        repo.addIntervenor(report.id, intervenor)
        val removed = repo.removeIntervenor(report.id, intervenor)

        val updated = repo.findById(report.id)

        assertTrue(removed)
        assertNotNull(updated)
        assertTrue(updated.intervenors.isEmpty())
    }

    @Test
    fun `removeIntervenor returns false if not present`() {
        val report = repo.createReport(1, "R", "D", json("""{}"""), json("""{}"""))
        val intervenor = Intervenor(1, "159874598", "CC", "TestName", "958768396", "RUA TESTE")

        val result = repo.removeIntervenor(report.id, intervenor)

        assertFalse(result)
    }

    @Test
    fun `findByIntervenor returns correct reports`() {
        val intervenor = Intervenor(1, "159874598", "CC", "TestName", "958768396", "RUA TESTE")

        val r1 = repo.createReport(1, "R1", "D1", json("""{}"""), json("""{}"""))

        repo.addIntervenor(r1.id, intervenor)

        val result = repo.findByIntervenor(intervenor)

        assertEquals(listOf(repo.findById(r1.id)), result)
    }

    @Test
    fun `addIntervenor returns false if report does not exist`() {
        val intervenor = Intervenor(1, "159874598", "CC", "TestName", "958768396", "RUA TESTE")

        val result = repo.addIntervenor(999, intervenor)

        assertFalse(result)
    }
}