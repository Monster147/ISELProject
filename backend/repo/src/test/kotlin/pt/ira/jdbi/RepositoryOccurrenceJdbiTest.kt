package pt.ira.jdbi

import com.fasterxml.jackson.databind.ObjectMapper
import org.jdbi.v3.core.Jdbi
import org.junit.jupiter.api.Assertions
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

class RepositoryOccurrenceJdbiTest {
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

    @BeforeEach
    fun setup() {
        trxManager.run {
            repoOccurrence.clear()
            repoIntervenor.clear()
            repoUsers.clear()
        }
    }

    @Test
    fun `createOccurrence and findById`() {
        trxManager.run {
            val creator =
                repoUsers.createUser(
                    "Creator",
                    "creator@mail.com",
                    PasswordValidationInfo("hash"),
                    listOf(1),
                )
            val created =
                repoOccurrence.createOccurrence(
                    endDate = LocalDate.of(2030, 3, 30),
                    reporterId = creator.id,
                    importance = OccurrenceType.NORMAL,
                    occurrenceType = mapper.readTree("""{"type":"fire"}"""),
                    occurrenceInfo = mapper.readTree("""{"location":"lisbon"}"""),
                )

            val found = repoOccurrence.findById(created.id)

            assertNotNull(found)
            assertEquals(created.id, found.id)
            assertEquals(created.endDate, found.endDate)
            assertEquals(created.reporterId, found.reporterId)
            assertEquals(created.importance, found.importance)
            assertEquals(created.occurrenceType, found.occurrenceType)
            assertEquals(created.occurrenceInfo, found.occurrenceInfo)
            assertTrue(found.initDate <= found.endDate)
        }
    }

    @Test
    fun `findAll returns all occurrences`() {
        trxManager.run {
            val creator1 =
                repoUsers.createUser(
                    "Creator1",
                    "creator1@mail.com",
                    PasswordValidationInfo("hash"),
                    listOf(1),
                )
            val creator2 =
                repoUsers.createUser(
                    "Creator2",
                    "creator2@mail.com",
                    PasswordValidationInfo("hash"),
                    listOf(1),
                )
            val o1 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 3, 30),
                    creator1.id,
                    OccurrenceType.NORMAL,
                    mapper.readTree("""{"t":"a"}"""),
                    mapper.readTree("""{"i":"a"}"""),
                )

            val o2 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 4, 1),
                    creator2.id,
                    OccurrenceType.URGENT,
                    mapper.readTree("""{"t":"b"}"""),
                    mapper.readTree("""{"i":"b"}"""),
                )

            val all = repoOccurrence.findAll()

            assertEquals(2, all.size)
            assertEquals(listOf(o1, o2), all)
        }
    }

    @Test
    fun `findByImportance returns only matches`() {
        trxManager.run {
            val creator1 =
                repoUsers.createUser(
                    "Creator1",
                    "creator1@mail.com",
                    PasswordValidationInfo("hash"),
                    listOf(1),
                )
            val creator2 =
                repoUsers.createUser(
                    "Creator2",
                    "creator2@mail.com",
                    PasswordValidationInfo("hash"),
                    listOf(1),
                )
            val creator3 =
                repoUsers.createUser(
                    "Creator3",
                    "creator3@mail.com",
                    PasswordValidationInfo("hash"),
                    listOf(1),
                )

            val o1 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 3, 30),
                    creator1.id,
                    OccurrenceType.NORMAL,
                    mapper.readTree("""{"t":"a"}"""),
                    mapper.readTree("""{"i":"a"}"""),
                )

            repoOccurrence.createOccurrence(
                LocalDate.of(2030, 4, 1),
                creator2.id,
                OccurrenceType.URGENT,
                mapper.readTree("""{"t":"b"}"""),
                mapper.readTree("""{"i":"b"}"""),
            )

            val o3 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 4, 2),
                    creator3.id,
                    OccurrenceType.NORMAL,
                    mapper.readTree("""{"t":"c"}"""),
                    mapper.readTree("""{"i":"c"}"""),
                )

            val normals = repoOccurrence.findByImportance(OccurrenceType.NORMAL)

            assertEquals(listOf(o1, o3), normals)
        }
    }

    @Test
    fun `findOccurrenceByReporterId returns only occurrences that contain that reporter`() {
        trxManager.run {
            val creator1 =
                repoUsers.createUser(
                    "Creator1",
                    "creator1@mail.com",
                    PasswordValidationInfo("hash"),
                    listOf(1),
                )
            val creator2 =
                repoUsers.createUser(
                    "Creator2",
                    "creator2@mail.com",
                    PasswordValidationInfo("hash"),
                    listOf(1),
                )
            val o1 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 3, 30),
                    creator1.id,
                    OccurrenceType.NORMAL,
                    mapper.readTree("""{"t":"a"}"""),
                    mapper.readTree("""{"i":"a"}"""),
                )

            val o2 =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 4, 1),
                    creator1.id,
                    OccurrenceType.URGENT,
                    mapper.readTree("""{"t":"b"}"""),
                    mapper.readTree("""{"i":"b"}"""),
                )

            repoOccurrence.createOccurrence(
                LocalDate.of(2030, 4, 2),
                creator2.id,
                OccurrenceType.CRITICAL,
                mapper.readTree("""{"t":"c"}"""),
                mapper.readTree("""{"i":"c"}"""),
            )

            val by2 = repoOccurrence.findOccurrenceByReporterId(creator1.id)

            assertEquals(listOf(o1, o2), by2)
        }
    }

    @Test
    fun `addIntervenor adds intervenor correctly`() {
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

            val intervenor =
                repoIntervenor.createIntervenor(
                    idNumber = "159874598",
                    idType = "CC",
                    name = "TestName",
                    contactInfo = "958768396",
                    address = "RUA TESTE",
                )

            val updatedReport = repoOccurrence.addIntervenor(occurrence, intervenor)
            val updatedFromRepo = repoOccurrence.findById(occurrence.id)

            assertNotNull(updatedFromRepo)
            Assertions.assertTrue(updatedFromRepo.intervenors.contains(intervenor.id))
            assertEquals(updatedReport, updatedFromRepo)
        }
    }

    @Test
    fun `addIntervenor does not duplicate intervenor`() {
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
            val intervenor =
                repoIntervenor.createIntervenor(
                    idNumber = "159874598",
                    idType = "CC",
                    name = "TestName",
                    contactInfo = "958768396",
                    address = "RUA TESTE",
                )

            val once = repoOccurrence.addIntervenor(occurrence, intervenor)
            val twice = repoOccurrence.addIntervenor(once, intervenor)

            assertEquals(1, twice.intervenors.count { it == intervenor.id })
        }
    }

    @Test
    fun `removeIntervenor removes intervenor`() {
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
            val intervenor =
                repoIntervenor.createIntervenor(
                    idNumber = "159874598",
                    idType = "CC",
                    name = "TestName",
                    contactInfo = "958768396",
                    address = "RUA TESTE",
                )

            val withIntervenor = repoOccurrence.addIntervenor(occurrence, intervenor)
            val removed = repoOccurrence.removeIntervenor(withIntervenor, intervenor)

            val updated = repoOccurrence.findById(occurrence.id)

            assertNotNull(updated)
            assertTrue(updated.intervenors.isEmpty())
            assertEquals(removed, updated)
        }
    }

    @Test
    fun `removeIntervenor does nothing if not present`() {
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
            val intervenor =
                repoIntervenor.createIntervenor(
                    idNumber = "159874598",
                    idType = "CC",
                    name = "TestName",
                    contactInfo = "958768396",
                    address = "RUA TESTE",
                )

            val removed = repoOccurrence.removeIntervenor(occurrence, intervenor)
            val updated = repoOccurrence.findById(occurrence.id)

            assertNotNull(updated)
            assertEquals(occurrence, removed)
            assertEquals(occurrence, updated)
        }
    }

    @Test
    fun `findByIntervenor returns correct reports`() {
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

            val intervenor =
                repoIntervenor.createIntervenor(
                    idNumber = "159874598",
                    idType = "CC",
                    name = "TestName",
                    contactInfo = "958768396",
                    address = "RUA TESTE",
                )

            val withIntervenor = repoOccurrence.addIntervenor(occurrence, intervenor)

            val result = repoOccurrence.findByIntervenor(intervenor)

            assertEquals(listOf(withIntervenor), result)
        }
    }

    @Test
    fun `save updates an existing occurrence`() {
        trxManager.run {
            val creator1 =
                repoUsers.createUser(
                    "Creator1",
                    "creator1@mail.com",
                    PasswordValidationInfo("hash"),
                    listOf(1),
                )
            val creator2 =
                repoUsers.createUser(
                    "Creator2",
                    "creator2@mail.com",
                    PasswordValidationInfo("hash"),
                    listOf(1),
                )

            val created =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 3, 30),
                    creator1.id,
                    OccurrenceType.NORMAL,
                    mapper.readTree("""{"t":"a"}"""),
                    mapper.readTree("""{"i":"a"}"""),
                )

            val updated =
                created.copy(
                    endDate = LocalDate.of(2030, 4, 10),
                    reporterId = creator2.id,
                    importance = OccurrenceType.CRITICAL,
                    occurrenceType = mapper.readTree("""{"t":"updated"}"""),
                    occurrenceInfo = mapper.readTree("""{"i":"updated"}"""),
                )

            repoOccurrence.save(updated)

            val found = repoOccurrence.findById(created.id)

            assertEquals(updated, found)
        }
    }

    @Test
    fun `deleteById removes occurrence`() {
        trxManager.run {
            val creator1 =
                repoUsers.createUser(
                    "Creator1",
                    "creator1@mail.com",
                    PasswordValidationInfo("hash"),
                    listOf(1),
                )
            val created =
                repoOccurrence.createOccurrence(
                    LocalDate.of(2030, 3, 30),
                    creator1.id,
                    OccurrenceType.NORMAL,
                    mapper.readTree("""{"t":"a"}"""),
                    mapper.readTree("""{"i":"a"}"""),
                )

            repoOccurrence.deleteById(created.id)

            assertNull(repoOccurrence.findById(created.id))
            assertTrue(repoOccurrence.findAll().isEmpty())
        }
    }

    @Test
    fun `clear removes all occurrences`() {
        trxManager.run {
            val creator1 =
                repoUsers.createUser(
                    "Creator1",
                    "creator1@mail.com",
                    PasswordValidationInfo("hash"),
                    listOf(1),
                )
            val creator2 =
                repoUsers.createUser(
                    "Creator2",
                    "creator2@mail.com",
                    PasswordValidationInfo("hash"),
                    listOf(1),
                )

            repoOccurrence.createOccurrence(
                LocalDate.of(2030, 3, 30),
                creator1.id,
                OccurrenceType.NORMAL,
                mapper.readTree("""{"t":"a"}"""),
                mapper.readTree("""{"i":"a"}"""),
            )

            repoOccurrence.createOccurrence(
                LocalDate.of(2030, 4, 1),
                creator2.id,
                OccurrenceType.URGENT,
                mapper.readTree("""{"t":"b"}"""),
                mapper.readTree("""{"i":"b"}"""),
            )

            repoOccurrence.clear()

            assertTrue(repoOccurrence.findAll().isEmpty())
        }
    }
}
