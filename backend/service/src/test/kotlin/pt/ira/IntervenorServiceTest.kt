package pt.ira

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import pt.ira.interfaces.TransactionManager
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertTrue

@SpringJUnitConfig(TestConfig::class)
class IntervenorServiceTest {
    @Autowired
    private lateinit var service: IntervenorService

    @Autowired
    private lateinit var trxManager: TransactionManager

    @BeforeEach
    fun reset() {
        trxManager.run {
            repoIntervenor.clear()
        }
    }

    @Test
    fun `createIntervenor creates intervenor`() {
        val intervenor =
            service.createIntervenor(
                idNumber = "123",
                idType = "CC",
                name = "Alice",
                contactInfo = "alice@mail.com",
                address = "Lisboa",
            ).let {
                check(it is Success)
                it.value
            }

        assertEquals("123", intervenor.idNumber)
        assertEquals("Alice", intervenor.name)
    }

    @Test
    fun `createIntervenor fails if already exists`() {
        service.createIntervenor("123", "CC", "Alice", "alice@mail.com", "Lisboa")

        val result = service.createIntervenor("123", "CC", "Alice2", "other@mail.com", "Porto")

        assertIs<Either.Left<*>>(result)
        assertIs<IntervenorError.IntervenorAlreadyExists>(result.value)
    }

    @Test
    fun `updateIntervenor updates fields`() {
        val created =
            service.createIntervenor(
                "234",
                "CC",
                "Alice",
                "alice@mail.com",
                "Lisboa",
            ).let {
                check(it is Success)
                it.value
            }

        val updated =
            service.updateIntervenor(
                intervenorId = created.id,
                idNumber = null,
                idType = null,
                name = "Alice Updated",
                contactInfo = null,
                address = "Porto",
            ).let {
                check(it is Success)
                it.value
            }

        assertEquals("Alice Updated", updated.name)
        assertEquals("Porto", updated.address)
        assertEquals("234", updated.idNumber) // unchanged
    }

    @Test
    fun `updateIntervenor fails if not found`() {
        val result =
            service.updateIntervenor(
                intervenorId = 999,
                idNumber = null,
                idType = null,
                name = "X",
                contactInfo = null,
                address = null,
            )

        assertIs<Either.Left<*>>(result)
        assertIs<IntervenorError.IntervenorNotFound>(result.value)
    }

    @Test
    fun `deleteIntervenorByIdNumber removes intervenor`() {
        service.createIntervenor("345", "CC", "Alice", "alice@mail.com", "Lisboa")

        val result = service.deleteIntervenorByIdNumber("345")

        assertIs<Success<Boolean>>(result)
        assertTrue(result.value)

        val find = service.findByIntervenorByIdNumber("345")
        assertIs<Either.Left<*>>(find)
        assertIs<IntervenorError.IntervenorNotFound>(find.value)
    }

    @Test
    fun `deleteIntervenorByIdNumber fails if not found`() {
        val result = service.deleteIntervenorByIdNumber("999")

        assertIs<Either.Left<*>>(result)
        assertIs<IntervenorError.IntervenorNotFound>(result.value)
    }

    @Test
    fun `findByIntervenorByIdNumber returns intervenor`() {
        val created =
            service.createIntervenor(
                "456",
                "CC",
                "Alice",
                "alice@mail.com",
                "Lisboa",
            ).let {
                check(it is Success)
                it.value
            }

        val found =
            service.findByIntervenorByIdNumber("456").let {
                check(it is Success)
                it.value
            }

        assertEquals(created.id, found.id)
    }

    @Test
    fun `findByIntervenorByIdNumber fails if not found`() {
        val result = service.findByIntervenorByIdNumber("999")

        assertIs<Either.Left<*>>(result)
        assertIs<IntervenorError.IntervenorNotFound>(result.value)
    }

    @Test
    fun `findByIntervenorContactInfo returns intervenor`() {
        val created =
            service.createIntervenor(
                "567",
                "CC",
                "Alice",
                "alice@mail.com",
                "Lisboa",
            ).let {
                check(it is Success)
                it.value
            }

        val found =
            service.findByIntervenorContactInfo("alice@mail.com").let {
                check(it is Success)
                it.value
            }

        assertEquals(created.id, found.id)
    }

    @Test
    fun `findByIntervenorContactInfo fails if not found`() {
        val result = service.findByIntervenorContactInfo("notfound@mail.com")

        assertIs<Either.Left<*>>(result)
        assertIs<IntervenorError.IntervenorNotFound>(result.value)
    }
}
