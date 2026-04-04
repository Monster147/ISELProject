package pt.ira.jdbi

import com.fasterxml.jackson.databind.ObjectMapper
import org.jdbi.v3.core.Jdbi
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.postgresql.ds.PGSimpleDataSource
import pt.ira.occurrence.OccurrenceType
import pt.ira.user.PasswordValidationInfo
import java.time.LocalDate
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class RepositoryEvidenceJdbiTest {
    companion object {
        private val jdbi: Jdbi =
            Jdbi.create(
                PGSimpleDataSource().apply {
                    setURL(Environment.getDbUrl())
                },
            ).configureWithAppRequirements()

        private val trxManager = TransactionManagerJdbi(jdbi)
    }

    private val mapper = ObjectMapper()

    private fun json(str: String) = mapper.readTree(str)

    @BeforeEach
    fun setup() {
        trxManager.run {
            repoEvidence.clear()
            repoReport.clear()
            repoUsers.clear()
        }
    }

    @Test
    fun `createEvidence and findById`() {
        trxManager.run {
            val user = repoUsers.createUser("Alice", "alice@isel.pt", PasswordValidationInfo("hash"), listOf(1))
            val occurrence =
                repoOccurrence.createOccurrence(
                    endDate = LocalDate.of(2030, 3, 30),
                    reporterId = user.id,
                    importance = OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )
            val report =
                repoReport.createReport(
                    creatorId = user.id,
                    occurrenceId = occurrence.id,
                    title = "Title",
                    description = "Desc",
                    type = json("""{"type":"R"}"""),
                    addons = json("""{}"""),
                )

            val evidence =
                repoEvidence.createEvidence(
                    type = json("""{"type":"image"}"""),
                    filePath = "path/file.png",
                    location = "Lisbon",
                    description = "desc",
                    reporterId = user.id,
                    reportId = report.id,
                )

            val found = repoEvidence.findById(evidence.id)
            assertNotNull(found)
            assertEquals(evidence.copy(createdAt = found.createdAt, updatedAt = found.updatedAt), found)
        }
    }

    @Test
    fun `findAll returns all evidences`() {
        trxManager.run {
            val u1 = repoUsers.createUser("U1", "u1@isel.pt", PasswordValidationInfo("hash"), listOf(1))
            val u2 = repoUsers.createUser("U2", "u2@isel.pt", PasswordValidationInfo("hash"), listOf(1))

            val occurrence1 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 3, 30),
                    u1.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )
            val occurrence2 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 4, 1),
                    u2.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )

            val r1 = repoReport.createReport(u1.id, occurrence1.id, "R1", "Desc1", json("""{}"""), json("""{}"""))
            val r2 = repoReport.createReport(u2.id, occurrence2.id, "R2", "Desc2", json("""{}"""), json("""{}"""))

            val e1 = repoEvidence.createEvidence(json("""{}"""), "f1", "L1", "d1", u1.id, r1.id)
            val e2 = repoEvidence.createEvidence(json("""{}"""), "f2", "L2", "d2", u2.id, r2.id)

            val all = repoEvidence.findAll()
            assertEquals(listOf(e1, e2), all)
        }
    }

    @Test
    fun `findByReportId returns correct evidences`() {
        trxManager.run {
            val u1 = repoUsers.createUser("U1", "u1@isel.pt", PasswordValidationInfo("hash"), listOf(1))
            val u2 = repoUsers.createUser("U2", "u2@isel.pt", PasswordValidationInfo("hash"), listOf(1))

            val occurrence1 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 3, 30),
                    u1.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )
            val occurrence2 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 4, 1),
                    u2.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )

            val r1 = repoReport.createReport(u1.id, occurrence1.id, "R1", "Desc", json("""{}"""), json("""{}"""))
            val r2 = repoReport.createReport(u2.id, occurrence2.id, "R2", "Desc", json("""{}"""), json("""{}"""))

            val e1 = repoEvidence.createEvidence(json("""{}"""), "f1", "L1", "d1", u1.id, r1.id)
            repoEvidence.createEvidence(json("""{}"""), "f2", "L2", "d2", u2.id, r2.id)

            val result = repoEvidence.findByReportId(r1.id)
            assertEquals(listOf(e1), result)
        }
    }

    @Test
    fun `findByReporterId returns correct evidences`() {
        trxManager.run {
            val u1 = repoUsers.createUser("U1", "u1@isel.pt", PasswordValidationInfo("hash"), listOf(1))
            val u2 = repoUsers.createUser("U2", "u2@isel.pt", PasswordValidationInfo("hash"), listOf(1))

            val occurrence1 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 3, 30),
                    u1.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )

            val report = repoReport.createReport(u1.id, occurrence1.id, "Shared", "Desc", json("""{}"""), json("""{}"""))

            val e1 = repoEvidence.createEvidence(json("""{}"""), "f1", "L1", "d1", u1.id, report.id)
            repoEvidence.createEvidence(json("""{}"""), "f2", "L2", "d2", u2.id, report.id)

            val result = repoEvidence.findByReporterId(u1.id)
            assertEquals(listOf(e1), result)
        }
    }

    @Test
    fun `findByType returns correct evidences`() {
        trxManager.run {
            val user = repoUsers.createUser("U", "u@isel.pt", PasswordValidationInfo("hash"), listOf(1))

            val occurrence =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 3, 30),
                    user.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )

            val report = repoReport.createReport(user.id, occurrence.id, "R", "Desc", json("""{}"""), json("""{}"""))

            val typeA = json("""{"type":"A"}""")
            val typeB = json("""{"type":"B"}""")

            val e1 = repoEvidence.createEvidence(typeA, "f1", "L1", "d1", user.id, report.id)
            repoEvidence.createEvidence(typeB, "f2", "L2", "d2", user.id, report.id)

            val result = repoEvidence.findByType(typeA)
            assertEquals(listOf(e1), result)
        }
    }

    @Test
    fun `findByLocation returns correct evidences`() {
        trxManager.run {
            val user = repoUsers.createUser("U", "u@isel.pt", PasswordValidationInfo("hash"), listOf(1))

            val occurrence =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 3, 30),
                    user.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )

            val report = repoReport.createReport(user.id, occurrence.id, "R", "Desc", json("""{}"""), json("""{}"""))

            val e1 = repoEvidence.createEvidence(json("""{}"""), "f1", "Lisbon", "d1", user.id, report.id)
            repoEvidence.createEvidence(json("""{}"""), "f2", "Porto", "d2", user.id, report.id)

            val result = repoEvidence.findByLocation("Lisbon")
            assertEquals(listOf(e1), result)
        }
    }

    @Test
    fun `deleteById removes evidence`() {
        trxManager.run {
            val user = repoUsers.createUser("U", "u@isel.pt", PasswordValidationInfo("hash"), listOf(1))
            val occurrence =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 3, 30),
                    user.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )

            val report = repoReport.createReport(user.id, occurrence.id, "R", "Desc", json("""{}"""), json("""{}"""))

            val e = repoEvidence.createEvidence(json("""{}"""), "f", "L", "d", user.id, report.id)
            repoEvidence.deleteById(e.id)
            assertNull(repoEvidence.findById(e.id))
        }
    }

    @Test
    fun `save updates existing evidence`() {
        trxManager.run {
            val user = repoUsers.createUser("U", "u@isel.pt", PasswordValidationInfo("hash"), listOf(1))
            val occurrence =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 3, 30),
                    user.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )

            val report = repoReport.createReport(user.id, occurrence.id, "R", "Desc", json("""{}"""), json("""{}"""))

            val e = repoEvidence.createEvidence(json("""{}"""), "f", "L", "d", user.id, report.id)
            val updated = e.copy(description = "updated")
            repoEvidence.save(updated)
            assertEquals("updated", repoEvidence.findById(e.id)?.description)
        }
    }

    @Test
    fun `clear removes all evidences`() {
        trxManager.run {
            val u1 = repoUsers.createUser("U1", "u1@isel.pt", PasswordValidationInfo("hash"), listOf(1))
            val u2 = repoUsers.createUser("U2", "u2@isel.pt", PasswordValidationInfo("hash"), listOf(1))

            val occurrence1 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 3, 30),
                    u1.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )
            val occurrence2 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 4, 1),
                    u2.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )

            val r1 = repoReport.createReport(u1.id, occurrence1.id, "R1", "Desc1", json("""{}"""), json("""{}"""))
            val r2 = repoReport.createReport(u2.id, occurrence2.id, "R2", "Desc2", json("""{}"""), json("""{}"""))

            repoEvidence.createEvidence(json("""{}"""), "f1", "L1", "d1", u1.id, r1.id)
            repoEvidence.createEvidence(json("""{}"""), "f2", "L2", "d2", u2.id, r2.id)

            repoEvidence.clear()
            assertTrue(repoEvidence.findAll().isEmpty())
        }
    }
}
