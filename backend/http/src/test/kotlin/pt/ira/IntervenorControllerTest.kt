package pt.ira

import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import pt.ira.interfaces.TransactionManager
import pt.ira.intervenor.Intervenor
import pt.ira.model.intervenor.IntervenorInput
import pt.ira.model.intervenor.IntervenorUpdateInput
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

@SpringJUnitConfig(TestConfig::class)
class IntervenorControllerTest {
    @Autowired
    private lateinit var controller: IntervenorController

    @Autowired
    private lateinit var trxManager: TransactionManager

    @BeforeEach
    fun cleanup() {
        trxManager.run {
            repoIntervenor.clear()
        }
    }

    @Test
    fun `create intervenor and find by idNumber`() {
        val idNumber = "123"
        val input =
            IntervenorInput(
                idNumber = idNumber,
                idType = "CC",
                name = "John Doe",
                contactInfo = "john@mail.com",
                address = "Lisbon",
            )

        // create
        controller.createIntervenor(input).let { resp ->
            assertEquals(HttpStatus.CREATED, resp.statusCode)

            val location = resp.headers.getFirst(HttpHeaders.LOCATION)
            assertNotNull(location)
            assertTrue(location.startsWith("/api/intervenor"))
        }

        // find
        controller.findIntervenorByIdNumber(idNumber).also { resp ->
            assertEquals(HttpStatus.OK, resp.statusCode)
            val body = resp.body as Intervenor
            assertEquals(idNumber, body.idNumber)
        }
    }

    @Test
    fun `create duplicate intervenor returns bad request`() {
        val input = IntervenorInput("123", "CC", "John", "mail", "addr")

        controller.createIntervenor(input)
        val resp = controller.createIntervenor(input)

        assertEquals(HttpStatus.BAD_REQUEST, resp.statusCode)
    }

    @Test
    fun `update intervenor`() {
        val id = createIntervenor("123")

        val updateInput =
            IntervenorUpdateInput(
                idNumber = null,
                idType = null,
                name = "Updated Name",
                contactInfo = null,
                address = null,
            )

        val resp = controller.updateIntervenor(updateInput, id)

        assertEquals(HttpStatus.OK, resp.statusCode)

        val body = resp.body as Intervenor
        assertEquals("Updated Name", body.name)
    }

    @Test
    fun `update non existing intervenor returns error`() {
        val updateInput =
            IntervenorUpdateInput(
                null,
                null,
                "Name",
                null,
                null,
            )

        val resp = controller.updateIntervenor(updateInput, 999)

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `delete intervenor`() {
        val idNumber = "123"
        createIntervenor(idNumber)

        val resp = controller.deleteIntervenorByIdNumber(idNumber)

        assertEquals(HttpStatus.NO_CONTENT, resp.statusCode)

        val findResp = controller.findIntervenorByIdNumber(idNumber)
        assertEquals(HttpStatus.NOT_FOUND, findResp.statusCode)
    }

    @Test
    fun `delete non existing intervenor returns error`() {
        val resp = controller.deleteIntervenorByIdNumber("999")

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `find by contact info`() {
        val contact = "contact@mail.com"
        createIntervenor("123", contactInfo = contact)

        val resp = controller.findIntervenorByContactInfo(contact)

        assertEquals(HttpStatus.OK, resp.statusCode)

        val body = resp.body as Intervenor
        assertEquals(contact, body.contactInfo)
    }

    @Test
    fun `find by contact info not found`() {
        val resp = controller.findIntervenorByContactInfo("nope")

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    private fun createIntervenor(
        idNumber: String,
        contactInfo: String = "mail@test.com",
    ): Int =
        controller.createIntervenor(
            IntervenorInput(
                idNumber = idNumber,
                idType = "CC",
                name = "Test",
                contactInfo = contactInfo,
                address = "Addr",
            ),
        ).let { resp ->
            val location =
                requireNotNull(
                    resp.headers.getFirst(HttpHeaders.LOCATION),
                ) { "Missing Location header" }
            location.split("/").last().toInt()
        }
}
