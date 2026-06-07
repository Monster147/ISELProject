package pt.ira.jdbi

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.jdbi.v3.core.Handle
import pt.ira.interfaces.RepositoryType
import pt.ira.type.Type
import java.sql.ResultSet

class RepositoryTypeJdbi(
    private val handle: Handle,
) : RepositoryType {
    override fun createType(
        name: String,
        form: JsonNode,
    ): Type {
        val id =
            handle.createUpdate(
                """
                INSERT INTO dbo.type (name, form)
                VALUES (:name, :form::jsonb)
                RETURNING id
                """.trimIndent(),
            )
                .bind("name", name)
                .bind("form", form.toString())
                .executeAndReturnGeneratedKeys()
                .mapTo(Int::class.java)
                .one()
        return Type(
            id = id,
            name = name,
            form = form,
        )
    }

    override fun findByName(name: String): Type? =
        handle.createQuery(
            """
            SELECT id, name, form
            from dbo.type
            WHERE name = :name
            """.trimIndent(),
        )
            .bind("name", name)
            .map { rs, _ -> mapRowToType(rs) }
            .singleOrNull()

    override fun findById(id: Int): Type? =
        handle.createQuery(
            """
            SELECT id, name, form
            from dbo.type
            WHERE id = :id
            """.trimIndent(),
        )
            .bind("id", id)
            .map { rs, _ -> mapRowToType(rs) }
            .singleOrNull()

    override fun findAll(): List<Type> =
        handle.createQuery(
            """
            SELECT id, name, form
            from dbo.type
            ORDER BY id
            """.trimIndent(),
        )
            .map { rs, _ -> mapRowToType(rs) }
            .list()

    override fun save(entity: Type) {
        handle.createUpdate(
            """
            UPDATE dbo.type
            SET name = :name,
                form = :form::jsonb
            WHERE id = :id
            """.trimIndent(),
        )
            .bind("name", entity.name)
            .bind("form", entity.form.toString())
            .bind("id", entity.id)
            .execute()
    }

    override fun deleteById(id: Int) {
        handle.createUpdate("DELETE FROM dbo.type WHERE id = :id")
            .bind("id", id)
            .execute()
    }

    override fun clear() {
        handle.createUpdate("DELETE FROM dbo.type").execute()
    }

    private val objectMapper = ObjectMapper()

    private fun mapRowToType(rs: ResultSet): Type {
        val id = rs.getInt("id")
        val name = rs.getString("name")
        val form = rs.getString("form")
        val formJson = objectMapper.readTree(form)
        return Type(
            id = id,
            name = name,
            form = formJson,
        )
    }
}
