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
    fun `findByStatus returns reports with given status`() {
        val r1 = reportService.createReport(1, "t1", "d", json("""{}"""), json("""{}"""))
            .let {
                check(it is Success)
                it.value
            }

        val r2 = reportService.createReport(2, "t2", "d", json("""{}"""), json("""{}"""))
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
        val user = trxManager.run {
            repoUsers.createUser("u", "u@mail", PasswordValidationInfo("x"), listOf(1))
        }

        val r1 = reportService.createReport(user.id, "t1", "d", json("""{}"""), json("""{}"""))
            .let {
                check(it is Success)
                it.value
            }

        val r2 = reportService.createReport(user.id, "t2", "d", json("""{}"""), json("""{}"""))
            .let {
                check(it is Success)
                it.value
            }

        reportService.addEditor(r1.id, user.id)

        val result = reportService.findByEditor(user.id)

        assertEquals(1, result.size)
        assertEquals(r1.id, result.first().id)
    }

    @Test
    fun `findByType returns reports with matching type`() {
        val typeA = json("""{"t":"a"}""")
        val typeB = json("""{"t":"b"}""")

        reportService.createReport(1, "t1", "d", typeA, json("""{}"""))
        reportService.createReport(2, "t2", "d", typeB, json("""{}"""))

        val result = reportService.findByType(typeA)

        assertEquals(1, result.size)
        assertEquals("t1", result.first().title)
    }

    @Test
    fun `findByIntervenor returns reports for intervenor`() {
        val intervenor = trxManager.run {
            repoIntervenor.createIntervenor("123", "CC", "name", "contact", "addr")
        }

        val r1 = reportService.createReport(1, "t1", "d", json("""{}"""), json("""{}"""))
            .let {
                check(it is Success)
                it.value
            }

        val r2 = reportService.createReport(2, "t2", "d", json("""{}"""), json("""{}"""))
            .let {
                check(it is Success)
                it.value
            }

        reportService.addIntervenor(r1.id, intervenor.id)

        val result = reportService.findByIntervenor(intervenor)

        assertEquals(1, result.size)
        assertEquals(r1.id, result.first().id)
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
    fun `removeEditor removes editor from report`() {
        val user = trxManager.run {
            repoUsers.createUser("u", "u@mail", PasswordValidationInfo("x"), listOf(1))
        }

        val report = reportService.createReport(user.id, "t", "d", json("""{}"""), json("""{}"""))
            .let {
                check(it is Success)
                it.value
            }

        reportService.addEditor(report.id, user.id)

        val updated = reportService.removeEditor(report.id, user.id)
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
        val report = reportService.createReport(1, "t", "d", json("""{}"""), json("""{}"""))
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
    fun `removeIntervenor removes intervenor from report`() {
        val intervenor = trxManager.run {
            repoIntervenor.createIntervenor("123", "CC", "name", "contact", "addr")
        }

        val report = reportService.createReport(1, "t", "d", json("""{}"""), json("""{}"""))
            .let {
                check(it is Success)
                it.value
            }

        reportService.addIntervenor(report.id, intervenor.id)

        val updated = reportService.removeIntervenor(report.id, intervenor.id)
            .let {
                check(it is Success)
                it.value
            }

        assertTrue(!updated.intervenors.contains(intervenor.id))
    }

    @Test
    fun `removeIntervenor fails if report not found`() {
        val result = reportService.removeIntervenor(999, 1)

        assertIs<Either.Left<*>>(result)
        assertIs<ReportError.ReportNotFound>(result.value)
    }

    @Test
    fun `removeIntervenor fails if intervenor not found`() {
        val report = reportService.createReport(1, "t", "d", json("""{}"""), json("""{}"""))
            .let {
                check(it is Success)
                it.value
            }

        val result = reportService.removeIntervenor(report.id, 999)

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

    @Test
    fun `getTypePercentagesByReporter returns empty list when no reports`() {
        val result = reportService.getTypePercentagesByReporter(999)

        assertTrue(result.isEmpty())
    }

    @Test
    fun `getTypePercentagesByReporter returns 100 percent for single type`() {
        val typeA = json("""{"t":"a"}""")

        val user = trxManager.run {
            repoUsers.createUser("u", "u@mail", PasswordValidationInfo("x"), listOf(1))
        }

        repeat(3) {
            val report = reportService.createReport(user.id, "t$it", "d", typeA, json("""{}"""))
                .let {
                    check(it is Success)
                    it.value
                }

            reportService.addEditor(report.id, user.id)
        }

        val result = reportService.getTypePercentagesByReporter(user.id)

        assertEquals(1, result.size)
        val entry = result.first()

        assertEquals(3, entry.count)
        assertEquals(100.0, entry.percentage)
        assertEquals(typeA, entry.type)
    }

    @Test
    fun `getTypePercentagesByReporter calculates correct percentages`() {
        val typeA = json("""{"t":"a"}""")
        val typeB = json("""{"t":"b"}""")

        val user = trxManager.run {
            repoUsers.createUser("u", "u@mail", PasswordValidationInfo("x"), listOf(1))
        }

        repeat(2) {
            val report = reportService.createReport(user.id, "a$it", "d", typeA, json("""{}"""))
                .let {
                    check(it is Success)
                    it.value
                }

            reportService.addEditor(report.id, user.id)
        }

        repeat(1) {
            val report = reportService.createReport(user.id, "b$it", "d", typeB, json("""{}"""))
                .let {
                    check(it is Success)
                    it.value
                }

            reportService.addEditor(report.id, user.id)
        }

        val result = reportService.getTypePercentagesByReporter(user.id)
        println(result)

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
        val typeA = json("""{"t":"a"}""")
        val typeB = json("""{"t":"b"}""")

        val user = trxManager.run {
            repoUsers.createUser("u", "u@mail", PasswordValidationInfo("x"), listOf(1))
        }

        repeat(3) {
            val report = reportService.createReport(user.id, "a$it", "d", typeA, json("""{}"""))
                .let {
                    check(it is Success)
                    it.value
                }

            reportService.addEditor(report.id, user.id)
        }

        repeat(1) {
            val report = reportService.createReport(user.id, "b$it", "d", typeB, json("""{}"""))
                .let {
                    check(it is Success)
                    it.value
                }

            reportService.addEditor(report.id, user.id)
        }

        val result = reportService.getTypePercentagesByReporter(user.id)

        assertEquals(typeA.toString(), result[0].type.toString())
        assertEquals(typeB.toString(), result[1].type.toString())
    }

    @Test
    fun `getTypePercentagesByReporter sorts by type when counts equal`() {
        val typeA = json("""{"t":"a"}""")
        val typeB = json("""{"t":"b"}""")

        val user = trxManager.run {
            repoUsers.createUser("u", "u@mail", PasswordValidationInfo("x"), listOf(1))
        }

        val r1 = reportService.createReport(user.id, "a", "d", typeA, json("""{}"""))
            .let {
                check(it is Success)
                it.value
            }

        val r2 = reportService.createReport(user.id, "b", "d", typeB, json("""{}"""))
            .let {
                check(it is Success)
                it.value
            }

        reportService.addEditor(r1.id, user.id)
        reportService.addEditor(r2.id, user.id)

        val result = reportService.getTypePercentagesByReporter(user.id)

        assertEquals(2, result.size)

        // since counts equal, sorted by type.toString()
        assertTrue(result[0].type.toString() <= result[1].type.toString())
    }

    @Test
    fun `getTypePercentagesByReporter only considers reports where user is editor`() {
        val typeA = json("""{"t":"a"}""")

        val user1 = trxManager.run {
            repoUsers.createUser("u1", "u1@mail", PasswordValidationInfo("x"), listOf(1))
        }

        val user2 = trxManager.run {
            repoUsers.createUser("u2", "u2@mail", PasswordValidationInfo("x"), listOf(1))
        }

        val r1 = reportService.createReport(user1.id, "t1", "d", typeA, json("""{}"""))
            .let {
                check(it is Success)
                it.value
            }

        val r2 = reportService.createReport(user2.id, "t2", "d", typeA, json("""{}"""))
            .let {
                check(it is Success)
                it.value
            }

        reportService.addEditor(r1.id, user1.id)
        reportService.addEditor(r2.id, user2.id)

        val result = reportService.getTypePercentagesByReporter(user1.id)

        assertEquals(1, result.size)
        assertEquals(1, result.first().count)
    }
}