package pt.ira

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import pt.ira.interfaces.TransactionManager
import pt.ira.model.type.TypeCreateInput
import pt.ira.model.type.TypeUpdateInput
import pt.ira.type.Type
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

@SpringJUnitConfig(TestConfig::class)
class TypeControllerTest {
    @Autowired
    private lateinit var controller: TypeController

    @Autowired
    private lateinit var trxManager: TransactionManager

    private val mapper = ObjectMapper()

    private fun json(v: String) = mapper.readTree(v)

    @BeforeEach
    fun cleanup() {
        trxManager.run {
            repoType.clear()
        }
    }

    @Test
    fun `create type success`() {
        val resp =
            controller.createType(
                TypeCreateInput(
                    name = "type1",
                    form = json("""{}"""),
                ),
            )

        assertEquals(HttpStatus.CREATED, resp.statusCode)
        assertNotNull(resp.headers.getFirst(HttpHeaders.LOCATION))
    }

    @Test
    fun `create type invalid name`() {
        val resp =
            controller.createType(
                TypeCreateInput(
                    name = "",
                    form = json("""{}"""),
                ),
            )

        assertEquals(HttpStatus.BAD_REQUEST, resp.statusCode)
    }

    @Test
    fun `create type duplicate name`() {
        createType("type1")

        val resp =
            controller.createType(
                TypeCreateInput(
                    name = "type1",
                    form = json("""{}"""),
                ),
            )

        assertEquals(HttpStatus.BAD_REQUEST, resp.statusCode)
    }

    @Test
    fun `find type by id success`() {
        val id = createType()

        val resp = controller.findById(id)

        assertEquals(HttpStatus.OK, resp.statusCode)
        assertIs<Type>(resp.body)
    }

    @Test
    fun `find type by id not found`() {
        val resp = controller.findById(999)

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `find type by name success`() {
        createType("type1")

        val resp = controller.findByName("type1")

        assertEquals(HttpStatus.OK, resp.statusCode)
        assertIs<Type>(resp.body)
    }

    @Test
    fun `find type by name not found`() {
        val resp = controller.findByName("unknown")

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `find all types`() {
        createType("t1")
        createType("t2")

        val resp = controller.findAll()

        assertEquals(HttpStatus.OK, resp.statusCode)
        val list = resp.body as List<*>
        assertEquals(2, list.size)
    }

    @Test
    fun `find all empty`() {
        val resp = controller.findAll()

        assertEquals(HttpStatus.OK, resp.statusCode)
        val list = resp.body as List<*>
        assertTrue(list.isEmpty())
    }

    @Test
    fun `update type success`() {
        val id = createType("old")

        val resp =
            controller.updateType(
                id,
                TypeUpdateInput(
                    name = "new",
                    form = json("""{"a":1}"""),
                ),
            )

        assertEquals(HttpStatus.OK, resp.statusCode)

        val updated = resp.body as Type
        assertEquals("new", updated.name)
    }

    @Test
    fun `update type not found`() {
        val resp =
            controller.updateType(
                999,
                TypeUpdateInput(
                    name = "new",
                    form = json("""{}"""),
                ),
            )

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    @Test
    fun `update type partial update`() {
        val id = createType("old")

        val resp =
            controller.updateType(
                id,
                TypeUpdateInput(
                    name = null,
                    form = json("""{"x":1}"""),
                ),
            )

        assertEquals(HttpStatus.OK, resp.statusCode)

        val updated = resp.body as Type
        assertEquals("old", updated.name)
        assertEquals(1, updated.form["x"].asInt())
    }

    @Test
    fun `delete type success`() {
        val id = createType()

        val resp = controller.deleteById(id)

        assertEquals(HttpStatus.NO_CONTENT, resp.statusCode)

        val find = controller.findById(id)
        assertEquals(HttpStatus.NOT_FOUND, find.statusCode)
    }

    @Test
    fun `delete type not found`() {
        val resp = controller.deleteById(999)

        assertEquals(HttpStatus.NOT_FOUND, resp.statusCode)
    }

    private fun createType(name: String = "type"): Int =
        controller.createType(
            TypeCreateInput(
                name = name,
                form = json("""{}"""),
            ),
        ).let { resp ->
            val location =
                requireNotNull(resp.headers.getFirst(HttpHeaders.LOCATION))
            location.substringAfterLast("/").toInt()
        }
}
