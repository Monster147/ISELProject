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
            repoOccurrence.clear()
            repoUsers.clear()
        }
    }

    @Test
    fun `createEvidence and findById`() {
        trxManager.run {
            val user = repoUsers.createUser("Alice", "alice@isel.pt", PasswordValidationInfo("hash"), listOf(1))
            val type =
                repoType.createType(
                    "Type",
                    mapper.readTree("""{"name":"fire"}""")
                ).id
            val occurrence =
                repoOccurrence.createOccurrence(
                    endDate = LocalDate.of(2030, 3, 30),
                    reporterId = user.id,
                    importance = OccurrenceType.NORMAL,
                    occurrenceType = type,
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )

            val evidence =
                repoEvidence.createEvidence(
                    type = "image",
                    filePath = "path/file.png",
                    location = "Lisbon",
                    description = "desc",
                    reporterId = user.id,
                    occurrenceId = occurrence.id,
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
            val type =
                repoType.createType(
                    "Type",
                    mapper.readTree("""{"name":"fire"}""")
                ).id
            val occurrence1 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 3, 30),
                    u1.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = type,
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )
            val occurrence2 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 4, 1),
                    u2.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = type,
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )

            val e1 = repoEvidence.createEvidence("image", "f1", "L1", "d1", u1.id, occurrence1.id)
            val e2 = repoEvidence.createEvidence("image", "f2", "L2", "d2", u2.id, occurrence2.id)

            val all = repoEvidence.findAll()
            assertEquals(listOf(e1, e2), all)
        }
    }

    @Test
    fun `findByOccurrenceId returns correct evidences`() {
        trxManager.run {
            val u1 = repoUsers.createUser("U1", "u1@isel.pt", PasswordValidationInfo("hash"), listOf(1))
            val u2 = repoUsers.createUser("U2", "u2@isel.pt", PasswordValidationInfo("hash"), listOf(1))
            val type =
                repoType.createType(
                    "Type",
                    mapper.readTree("""{"name":"fire"}""")
                ).id
            val occurrence1 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 3, 30),
                    u1.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = type,
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )
            val occurrence2 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 4, 1),
                    u2.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = type,
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )

            val e1 = repoEvidence.createEvidence("image", "f1", "L1", "d1", u1.id, occurrence1.id)
            repoEvidence.createEvidence("image", "f2", "L2", "d2", u2.id, occurrence2.id)

            val result = repoEvidence.findByOccurrenceId(occurrence1.id)
            assertEquals(listOf(e1), result)
        }
    }

    @Test
    fun `findByReporterId returns correct evidences`() {
        trxManager.run {
            val u1 = repoUsers.createUser("U1", "u1@isel.pt", PasswordValidationInfo("hash"), listOf(1))
            val u2 = repoUsers.createUser("U2", "u2@isel.pt", PasswordValidationInfo("hash"), listOf(1))
            val type =
                repoType.createType(
                    "Type",
                    mapper.readTree("""{"name":"fire"}""")
                ).id
            val occurrence1 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 3, 30),
                    u1.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = type,
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )

            val e1 = repoEvidence.createEvidence("image", "f1", "L1", "d1", u1.id, occurrence1.id)
            repoEvidence.createEvidence("image", "f2", "L2", "d2", u2.id, occurrence1.id)

            val result = repoEvidence.findByReporterId(u1.id)
            assertEquals(listOf(e1), result)
        }
    }

    @Test
    fun `findByType returns correct evidences`() {
        trxManager.run {
            val user = repoUsers.createUser("U", "u@isel.pt", PasswordValidationInfo("hash"), listOf(1))
            val type =
                repoType.createType(
                    "Type",
                    mapper.readTree("""{"name":"fire"}""")
                ).id
            val occurrence =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 3, 30),
                    user.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = type,
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )

            val typeA = "A"
            val typeB = "B"

            val e1 = repoEvidence.createEvidence(typeA, "f1", "L1", "d1", user.id, occurrence.id)
            repoEvidence.createEvidence(typeB, "f2", "L2", "d2", user.id, occurrence.id)

            val result = repoEvidence.findByType(typeA)
            assertEquals(listOf(e1), result)
        }
    }

    @Test
    fun `findByLocation returns correct evidences`() {
        trxManager.run {
            val user = repoUsers.createUser("U", "u@isel.pt", PasswordValidationInfo("hash"), listOf(1))
            val type =
                repoType.createType(
                    "Type",
                    mapper.readTree("""{"name":"fire"}""")
                ).id
            val occurrence =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 3, 30),
                    user.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = type,
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )

            val e1 = repoEvidence.createEvidence("image", "f1", "Lisbon", "d1", user.id, occurrence.id)
            repoEvidence.createEvidence("image", "f2", "Porto", "d2", user.id, occurrence.id)

            val result = repoEvidence.findByLocation("Lisbon")
            assertEquals(listOf(e1), result)
        }
    }

    @Test
    fun `deleteById removes evidence`() {
        trxManager.run {
            val user = repoUsers.createUser("U", "u@isel.pt", PasswordValidationInfo("hash"), listOf(1))
            val type =
                repoType.createType(
                    "Type",
                    mapper.readTree("""{"name":"fire"}""")
                ).id
            val occurrence =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 3, 30),
                    user.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = type,
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )

            val e = repoEvidence.createEvidence("image", "f", "L", "d", user.id, occurrence.id)
            repoEvidence.deleteById(e.id)
            assertNull(repoEvidence.findById(e.id))
        }
    }

    @Test
    fun `save updates existing evidence`() {
        trxManager.run {
            val user = repoUsers.createUser("U", "u@isel.pt", PasswordValidationInfo("hash"), listOf(1))
            val type =
                repoType.createType(
                    "Type",
                    mapper.readTree("""{"name":"fire"}""")
                ).id
            val occurrence =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 3, 30),
                    user.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = type,
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )

            val e = repoEvidence.createEvidence("image", "f", "L", "d", user.id, occurrence.id)
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
            val type =
                repoType.createType(
                    "Type",
                    mapper.readTree("""{"name":"fire"}""")
                ).id
            val occurrence1 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 3, 30),
                    u1.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = type,
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )
            val occurrence2 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 4, 1),
                    u2.id,
                    OccurrenceType.NORMAL,
                    occurrenceType = type,
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )

            repoEvidence.createEvidence("image", "f1", "L1", "d1", u1.id, occurrence1.id)
            repoEvidence.createEvidence("image", "f2", "L2", "d2", u2.id, occurrence2.id)

            repoEvidence.clear()
            assertTrue(repoEvidence.findAll().isEmpty())
        }
    }
}
