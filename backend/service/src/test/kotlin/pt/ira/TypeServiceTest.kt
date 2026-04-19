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
class TypeServiceTest {

    private val mapper = ObjectMapper()
    private fun json(v: String) = mapper.readTree(v)

    @Autowired
    private lateinit var typeService: TypeService

    @Autowired
    private lateinit var trxManager: TransactionManager

    @BeforeEach
    fun reset() {
        trxManager.run {
            repoType.clear()
        }
    }

    @Test
    fun `createType creates type successfully`() {
        val result = typeService.createType("Fire", json("""{"a":1}"""))

        assertIs<Success<*>>(result)
        val type = (result as Success).value

        assertEquals("Fire", type.name)
        assertEquals(json("""{"a":1}"""), type.form)
    }

    @Test
    fun `createType fails when name is blank`() {
        val result = typeService.createType("   ", json("""{}"""))

        assertIs<Either.Left<*>>(result)
        assertIs<TypeError.InvalidName>(result.value)
    }

    @Test
    fun `createType fails when duplicate name`() {
        typeService.createType("Fire", json("""{}"""))

        val result = typeService.createType("Fire", json("""{}"""))

        assertIs<Either.Left<*>>(result)
        assertIs<TypeError.TypeAlreadyExists>(result.value)
    }

    @Test
    fun `findById returns type`() {
        val created =
            typeService.createType("Fire", json("""{}"""))
                .let { check(it is Success); it.value }

        val result = typeService.findById(created.id)

        assertIs<Success<*>>(result)
        assertEquals(created, (result as Success).value)
    }

    @Test
    fun `findById fails when not found`() {
        val result = typeService.findById(999)

        assertIs<Either.Left<*>>(result)
        assertIs<TypeError.TypeNotFound>(result.value)
    }

    @Test
    fun `findByName returns type`() {
        val created =
            typeService.createType("Fire", json("""{}"""))
                .let { check(it is Success); it.value }

        val result = typeService.findByName("Fire")

        assertIs<Success<*>>(result)
        assertEquals(created, (result as Success).value)
    }

    @Test
    fun `findByName fails when not found`() {
        val result = typeService.findByName("Unknown")

        assertIs<Either.Left<*>>(result)
        assertIs<TypeError.TypeNotFound>(result.value)
    }

    @Test
    fun `findAll returns all types`() {
        val t1 = typeService.createType("A", json("""{}""")).let { (it as Success).value }
        val t2 = typeService.createType("B", json("""{}""")).let { (it as Success).value }

        val result = typeService.findAll()

        assertEquals(listOf(t1, t2), result)
    }

    @Test
    fun `findAll returns empty list`() {
        val result = typeService.findAll()

        assertTrue(result.isEmpty())
    }

    @Test
    fun `updateType updates both name and form`() {
        val created =
            typeService.createType("Old", json("""{"a":1}"""))
                .let { (it as Success).value }

        val result =
            typeService.updateType(
                id = created.id,
                name = "New",
                form = json("""{"b":2}""")
            )

        assertIs<Success<*>>(result)
        val updated = (result as Success).value

        assertEquals("New", updated.name)
        assertEquals(json("""{"b":2}"""), updated.form)
    }

    @Test
    fun `updateType updates only name`() {
        val created =
            typeService.createType("Old", json("""{"a":1}"""))
                .let { (it as Success).value }

        val result =
            typeService.updateType(
                id = created.id,
                name = "New",
                form = null
            )

        val updated = (result as Success).value

        assertEquals("New", updated.name)
        assertEquals(json("""{"a":1}"""), updated.form)
    }

    @Test
    fun `updateType updates only form`() {
        val created =
            typeService.createType("Old", json("""{"a":1}"""))
                .let { (it as Success).value }

        val result =
            typeService.updateType(
                id = created.id,
                name = null,
                form = json("""{"b":2}""")
            )

        val updated = (result as Success).value

        assertEquals("Old", updated.name)
        assertEquals(json("""{"b":2}"""), updated.form)
    }

    @Test
    fun `updateType fails when type not found`() {
        val result =
            typeService.updateType(
                id = 999,
                name = "X",
                form = json("""{}""")
            )

        assertIs<Either.Left<*>>(result)
        assertIs<TypeError.TypeNotFound>(result.value)
    }

    @Test
    fun `deleteById removes type`() {
        val created =
            typeService.createType("Fire", json("""{}"""))
                .let { (it as Success).value }

        val result = typeService.deleteById(created.id)

        assertIs<Success<*>>(result)
        assertTrue((result as Success).value)

        val find = typeService.findById(created.id)
        assertIs<Either.Left<*>>(find)
    }

    @Test
    fun `deleteById fails when not found`() {
        val result = typeService.deleteById(999)

        assertIs<Either.Left<*>>(result)
        assertIs<TypeError.TypeNotFound>(result.value)
    }
}