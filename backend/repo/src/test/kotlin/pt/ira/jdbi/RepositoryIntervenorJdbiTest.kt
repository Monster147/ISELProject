package pt.ira.jdbi

import org.jdbi.v3.core.Jdbi
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.postgresql.ds.PGSimpleDataSource
import pt.ira.intervenor.Intervenor
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

class RepositoryIntervenorJdbiTest {

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

    @BeforeEach
    fun setup() {
        trxManager.run {
            repoIntervenor.clear()
        }
    }

    @Test
    fun `createIntervenor and findById returns correct intervenor`() {
        trxManager.run {
            val created = repoIntervenor.createIntervenor(
                idNumber = "ID123",
                idType = "passport",
                name = "Alice",
                contactInfo = "alice@mail.com",
                address = "Street 1"
            )

            val found = repoIntervenor.findById(created.id)
            assertEquals(created, found)
        }
    }

    @Test
    fun `findAll returns all intervenors`() {
        trxManager.run {
            val i1 = repoIntervenor.createIntervenor(
                idNumber = "ID123",
                idType = "passport",
                name = "Alice",
                contactInfo = "alice@mail.com",
                address = "Street 1"
            )
            val i2 = repoIntervenor.createIntervenor(
                idNumber = "ID456",
                idType = "idCard",
                name = "Bob",
                contactInfo = "bob@mail.com",
                address = "Street 2"
            )

            val all = repoIntervenor.findAll()
            assertEquals(listOf(i1, i2), all)
        }
    }

    @Test
    fun `deleteById removes intervenor`() {
        trxManager.run {
            val intervenor = repoIntervenor.createIntervenor(
                idNumber = "ID123",
                idType = "passport",
                name = "Alice",
                contactInfo = "alice@mail.com",
                address = "Street 1"
            )

            repoIntervenor.deleteById(intervenor.id)
            val found = repoIntervenor.findById(intervenor.id)

            assertNull(found)
        }
    }

    @Test
    fun `clear removes all intervenors`() {
        trxManager.run {
            repoIntervenor.createIntervenor(
                idNumber = "ID123",
                idType = "passport",
                name = "Alice",
                contactInfo = "alice@mail.com",
                address = "Street 1"
            )
            repoIntervenor.createIntervenor(
                idNumber = "ID456",
                idType = "idCard",
                name = "Bob",
                contactInfo = "bob@mail.com",
                address = "Street 2"
            )

            repoIntervenor.clear()
            assertTrue(repoIntervenor.findAll().isEmpty())
        }
    }

    @Test
    fun `findByIdNumber returns correct intervenor`() {
        trxManager.run {
            val i1 = repoIntervenor.createIntervenor(
                idNumber = "ID123",
                idType = "passport",
                name = "Alice",
                contactInfo = "alice@mail.com",
                address = "Street 1"
            )
            repoIntervenor.createIntervenor(
                idNumber = "ID456",
                idType = "idCard",
                name = "Bob",
                contactInfo = "bob@mail.com",
                address = "Street 2"
            )

            val found = repoIntervenor.findByIdNumber("ID123")
            assertEquals(i1, found)
            val notFound = repoIntervenor.findByIdNumber("ID999")
            assertNull(notFound)
        }
    }

    @Test
    fun `findByContactInfo returns correct intervenor`() {
        trxManager.run {
            val i1 = repoIntervenor.createIntervenor(
                idNumber = "ID123",
                idType = "passport",
                name = "Alice",
                contactInfo = "alice@mail.com",
                address = "Street 1"
            )
            repoIntervenor.createIntervenor(
                idNumber = "ID456",
                idType = "idCard",
                name = "Bob",
                contactInfo = "bob@mail.com",
                address = "Street 2"
            )

            val found = repoIntervenor.findByContactInfo("alice@mail.com")
            assertEquals(i1, found)
            val notFound = repoIntervenor.findByContactInfo("unknown@mail.com")
            assertNull(notFound)
        }
    }

    @Test
    fun `save replaces existing intervenor with same id`() {
        trxManager.run {
            val created = repoIntervenor.createIntervenor(
                idNumber = "ID123",
                idType = "passport",
                name = "Alice",
                contactInfo = "alice@mail.com",
                address = "Street 1"
            )

            val updated = created.copy(name = "Alice Updated")
            repoIntervenor.save(updated)

            val found = repoIntervenor.findById(created.id)
            assertEquals("Alice Updated", found!!.name)
        }
    }
}
