package pt.ira.jdbi

import com.fasterxml.jackson.databind.ObjectMapper
import org.jdbi.v3.core.Jdbi
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.postgresql.ds.PGSimpleDataSource
import pt.ira.occurrence.OccurrenceType
import pt.ira.report.ReportStatus
import pt.ira.user.PasswordValidationInfo
import java.time.LocalDate
import kotlin.run
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull

class RepositoryReportJdbiTest {
    companion object {
        private val jdbi: Jdbi =
            Jdbi
                .create(
                    PGSimpleDataSource().apply {
                        val url = Environment.getDbUrl()
                        setURL(url)
                    },
                ).configureWithAppRequirements()

        private val trxManager = TransactionManagerJdbi(jdbi)
    }

    private val mapper = ObjectMapper()

    private fun json(str: String) = mapper.readTree(str)

    @BeforeEach
    fun setup() {
        trxManager.run {
            repoReport.clear()
            repoUsers.clear()
            repoOccurrence.clear()
        }
    }

    @Test
    fun `createReport and findById`() {
        trxManager.run {
            val creator =
                repoUsers.createUser(
                    "Creator",
                    "creator@mail.com",
                    PasswordValidationInfo("hash"),
                    listOf(1),
                )

            val occurrence =
                repoOccurrence.createOccurrence(
                    endDate = LocalDate.of(2030, 3, 30),
                    reporterId = creator.id,
                    importance = OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )

            val report =
                repoReport.createReport(
                    creatorId = creator.id,
                    occurrenceId = occurrence.id,
                    title = "Title",
                    description = "Desc",
                    type = json("""{"type":"A"}"""),
                    addons = json("""{"extra":true}"""),
                )

            val found = repoReport.findById(report.id)

            assertEquals(report.copy(createdAt = found!!.createdAt, updatedAt = found.updatedAt), found)
        }
    }

    @Test
    fun `findAll returns all reports`() {
        trxManager.run {
            val creator1 = repoUsers.createUser("C1", "c1@mail.com", PasswordValidationInfo("h1"), listOf(1))
            val creator2 = repoUsers.createUser("C2", "c2@mail.com", PasswordValidationInfo("h2"), listOf(1))

            val occurrence1 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 3, 30),
                    creator1.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )
            val occurrence2 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 4, 1),
                    creator2.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )

            val r1 = repoReport.createReport(creator1.id, occurrence1.id, "R1", "D1", json("""{"t":"1"}"""), json("""{}"""))
            val r2 = repoReport.createReport(creator2.id, occurrence2.id, "R2", "D2", json("""{"t":"2"}"""), json("""{}"""))

            val all = repoReport.findAll()

            assertEquals(2, all.size)
            assertEquals(listOf(r1, r2), all)
        }
    }

    @Test
    fun `findByStatus returns correct reports`() {
        trxManager.run {
            val creator1 = repoUsers.createUser("C1", "c1@mail.com", PasswordValidationInfo("h1"), listOf(1))
            val creator2 = repoUsers.createUser("C2", "c2@mail.com", PasswordValidationInfo("h2"), listOf(1))

            val occurrence1 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 3, 30),
                    creator1.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )
            val occurrence2 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 4, 1),
                    creator2.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )

            val r1 = repoReport.createReport(creator1.id, occurrence1.id, "R1", "D1", json("""{"t":"1"}"""), json("""{}"""))
            repoReport.createReport(creator2.id, occurrence2.id, "R2", "D2", json("""{"t":"2"}"""), json("""{}"""))

            val r1Approved = repoReport.updateStatus(r1, ReportStatus.APPROVED)
            val approved = repoReport.findByStatus(ReportStatus.APPROVED)

            assertEquals(listOf(r1Approved), approved)
        }
    }

    @Test
    fun `addEditor adds editor correctly`() {
        trxManager.run {
            val creator = repoUsers.createUser("Creator", "c@mail.com", PasswordValidationInfo("h"), listOf(1))
            val editor = repoUsers.createUser("User", "user@mail.com", PasswordValidationInfo("hash"), listOf(1))

            val occurrence =
                repoOccurrence.createOccurrence(
                    endDate = LocalDate.of(2030, 3, 30),
                    reporterId = creator.id,
                    importance = OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )

            val report = repoReport.createReport(creator.id, occurrence.id, "R", "D", json("""{}"""), json("""{}"""))

            val updatedReport = repoReport.addEditor(report, editor)
            val updatedFromRepo = repoReport.findById(report.id)

            assertNotNull(updatedFromRepo)
            assertTrue(updatedFromRepo.editors.contains(editor.id))
            assertEquals(updatedReport, updatedFromRepo)
        }
    }

    @Test
    fun `addEditor does not duplicate editor`() {
        trxManager.run {
            val creator = repoUsers.createUser("Creator", "c@mail.com", PasswordValidationInfo("h"), listOf(1))
            val editor = repoUsers.createUser("User", "user@mail.com", PasswordValidationInfo("hash"), listOf(1))
            val occurrence =
                repoOccurrence.createOccurrence(
                    endDate = LocalDate.of(2030, 3, 30),
                    reporterId = creator.id,
                    importance = OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )
            val report = repoReport.createReport(creator.id, occurrence.id, "R", "D", json("""{}"""), json("""{}"""))

            val once = repoReport.addEditor(report, editor)
            val twice = repoReport.addEditor(once, editor)

            assertEquals(1, twice.editors.count { it == editor.id })
        }
    }

    @Test
    fun `removeEditor removes editor`() {
        trxManager.run {
            val creator = repoUsers.createUser("Creator", "c@mail.com", PasswordValidationInfo("h"), listOf(1))
            val editor = repoUsers.createUser("User", "user@mail.com", PasswordValidationInfo("hash"), listOf(1))
            val occurrence =
                repoOccurrence.createOccurrence(
                    endDate = LocalDate.of(2030, 3, 30),
                    reporterId = creator.id,
                    importance = OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )
            val report = repoReport.createReport(creator.id, occurrence.id, "R", "D", json("""{}"""), json("""{}"""))

            val withEditor = repoReport.addEditor(report, editor)
            val removed = repoReport.removeEditor(withEditor, editor)

            val updated = repoReport.findById(report.id)

            assertNotNull(updated)
            assertTrue(updated.editors.isEmpty())
            assertEquals(removed, updated)
        }
    }

    @Test
    fun `removeEditor does nothing if editor not present`() {
        trxManager.run {
            val creator = repoUsers.createUser("Creator", "c@mail.com", PasswordValidationInfo("h"), listOf(1))
            val editor = repoUsers.createUser("User", "user@mail.com", PasswordValidationInfo("hash"), listOf(1))
            val occurrence =
                repoOccurrence.createOccurrence(
                    endDate = LocalDate.of(2030, 3, 30),
                    reporterId = creator.id,
                    importance = OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )
            val report = repoReport.createReport(creator.id, occurrence.id, "R", "D", json("""{}"""), json("""{}"""))

            val removed = repoReport.removeEditor(report, editor)
            val updated = repoReport.findById(report.id)

            assertNotNull(updated)
            assertEquals(report, removed)
            assertEquals(report, updated)
        }
    }

    @Test
    fun `updateStatus changes report status`() {
        trxManager.run {
            val creator = repoUsers.createUser("Creator", "c@mail.com", PasswordValidationInfo("h"), listOf(1))
            val occurrence =
                repoOccurrence.createOccurrence(
                    endDate = LocalDate.of(2030, 3, 30),
                    reporterId = creator.id,
                    importance = OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )
            val report = repoReport.createReport(creator.id, occurrence.id, "R", "D", json("""{}"""), json("""{}"""))

            val updatedReport = repoReport.updateStatus(report, ReportStatus.APPROVED)
            val updatedFromRepo = repoReport.findById(report.id)

            assertNotNull(updatedFromRepo)
            assertEquals(ReportStatus.APPROVED, updatedFromRepo.status)
            assertEquals(updatedReport, updatedFromRepo)
        }
    }

    @Test
    fun `findByCreatorId returns correct reports`() {
        trxManager.run {
            val creator1 = repoUsers.createUser("C1", "c1@mail.com", PasswordValidationInfo("h1"), listOf(1))
            val creator2 = repoUsers.createUser("C2", "c2@mail.com", PasswordValidationInfo("h2"), listOf(1))
            val occurrence1 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 3, 30),
                    creator1.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )
            val occurrence2 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 4, 1),
                    creator2.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )
            val r1 = repoReport.createReport(creator1.id, occurrence1.id, "R1", "D1", json("""{}"""), json("""{}"""))
            repoReport.createReport(creator2.id, occurrence2.id, "R2", "D2", json("""{}"""), json("""{}"""))

            val result = repoReport.findByCreatorId(creator1.id)

            assertEquals(listOf(r1), result)
        }
    }

    @Test
    fun `findByType returns correct reports`() {
        trxManager.run {
            val creator1 = repoUsers.createUser("C1", "c1@mail.com", PasswordValidationInfo("h1"), listOf(1))
            val creator2 = repoUsers.createUser("C2", "c2@mail.com", PasswordValidationInfo("h2"), listOf(1))
            val typeA = json("""{"type":"A"}""")
            val typeB = json("""{"type":"B"}""")
            val occurrence1 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 3, 30),
                    creator1.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )
            val occurrence2 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 4, 1),
                    creator2.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )

            val r1 = repoReport.createReport(creator1.id, occurrence1.id, "R1", "D1", typeA, json("""{}"""))
            repoReport.createReport(creator2.id, occurrence2.id, "R2", "D2", typeB, json("""{}"""))

            val result = repoReport.findByType(typeA)

            assertEquals(listOf(r1), result)
        }
    }

    @Test
    fun `deleteById removes report`() {
        trxManager.run {
            val creator = repoUsers.createUser("Creator", "c@mail.com", PasswordValidationInfo("h"), listOf(1))
            val occurrence =
                repoOccurrence.createOccurrence(
                    endDate = LocalDate.of(2030, 3, 30),
                    reporterId = creator.id,
                    importance = OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )
            val report = repoReport.createReport(creator.id, occurrence.id, "R", "D", json("""{}"""), json("""{}"""))

            repoReport.deleteById(report.id)
            val found = repoReport.findById(report.id)

            assertNull(found)
        }
    }

    @Test
    fun `save updates existing report`() {
        trxManager.run {
            val creator = repoUsers.createUser("Creator", "c@mail.com", PasswordValidationInfo("h"), listOf(1))
            val occurrence =
                repoOccurrence.createOccurrence(
                    endDate = LocalDate.of(2030, 3, 30),
                    reporterId = creator.id,
                    importance = OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )
            val report = repoReport.createReport(creator.id, occurrence.id, "R", "D", json("""{}"""), json("""{}"""))

            val updated = report.copy(title = "Updated")
            repoReport.save(updated)

            val found = repoReport.findById(report.id)

            assertNotNull(found)
            assertEquals("Updated", found.title)
        }
    }

    @Test
    fun `clear removes all reports`() {
        trxManager.run {
            val creator1 = repoUsers.createUser("C1", "c1@mail.com", PasswordValidationInfo("h1"), listOf(1))
            val creator2 = repoUsers.createUser("C2", "c2@mail.com", PasswordValidationInfo("h2"), listOf(1))
            val occurrence1 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 3, 30),
                    creator1.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )
            val occurrence2 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 4, 1),
                    creator2.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )

            repoReport.createReport(creator1.id, occurrence1.id, "R1", "D1", json("""{}"""), json("""{}"""))
            repoReport.createReport(creator2.id, occurrence2.id, "R2", "D2", json("""{}"""), json("""{}"""))

            repoReport.clear()

            assertTrue(repoReport.findAll().isEmpty())
        }
    }

    @Test
    fun `findByOccurrenceId returns report for occurrence`() {
        trxManager.run {
            val creator = repoUsers.createUser("Creator", "creator@mail.com", PasswordValidationInfo("hash"), listOf(1))

            val occurrence =
                repoOccurrence.createOccurrence(
                    endDate = LocalDate.of(2030, 3, 30),
                    reporterId = creator.id,
                    importance = OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )

            val created =
                repoReport.createReport(
                    creatorId = creator.id,
                    occurrenceId = occurrence.id,
                    title = "Title",
                    description = "Desc",
                    type = json("""{"type":"A"}"""),
                    addons = json("""{"extra":true}"""),
                )

            val found = repoReport.findByOccurrenceId(occurrence.id)

            assertNotNull(found)
            assertEquals(created.copy(createdAt = found.createdAt, updatedAt = found.updatedAt), found)
        }
    }

    @Test
    fun `findByOccurrenceId returns null when no report exists for occurrence`() {
        trxManager.run {
            val creator = repoUsers.createUser("Creator", "creator@mail.com", PasswordValidationInfo("hash"), listOf(1))

            val occurrenceWithoutReport =
                repoOccurrence.createOccurrence(
                    endDate = LocalDate.of(2030, 3, 30),
                    reporterId = creator.id,
                    importance = OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )

            val found = repoReport.findByOccurrenceId(occurrenceWithoutReport.id)

            assertNull(found)
        }
    }
}
