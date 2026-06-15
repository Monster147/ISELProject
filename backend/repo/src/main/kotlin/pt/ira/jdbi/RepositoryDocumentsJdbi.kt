package pt.ira.jdbi

import org.jdbi.v3.core.Handle
import pt.ira.documents.Documents
import pt.ira.interfaces.RepositoryDocuments
import java.sql.ResultSet

class RepositoryDocumentsJdbi(
    private val handle: Handle,
) : RepositoryDocuments {
    private companion object {
        const val DOCUMENTS_COLUMNS = """id, name, type, file_path"""
    }

    override fun uploadDocumentInfo(
        name: String,
        type: String,
        filepath: String,
    ): Documents {
        val id =
            handle.createUpdate(
                """
                INSERT INTO dbo.documents (name, type, file_path)
                VALUES (:name, :type, :file_path)
                RETURNING id
                """.trimIndent(),
            )
                .bind("name", name)
                .bind("type", type)
                .bind("file_path", filepath)
                .executeAndReturnGeneratedKeys()
                .mapTo(Int::class.java)
                .one()
        return Documents(
            id,
            name,
            type,
            filepath,
        )
    }

    override fun findAllTypes(): List<String> =
        handle.createQuery(
            """
            SELECT DISTINCT type
            from dbo.documents
            ORDER BY type
            """.trimIndent(),
        )
            .mapTo(String::class.java)
            .list()

    override fun findByName(name: String): Documents? =
        handle.createQuery(
            """
            SELECT $DOCUMENTS_COLUMNS
            FROM dbo.documents
            WHERE name = :name
            """.trimIndent(),
        )
            .bind("name", name)
            .map { rs, _ -> mapRowToDocument(rs) }
            .singleOrNull()

    override fun findByType(type: String): List<Documents> =
        handle.createQuery(
            """
            SELECT $DOCUMENTS_COLUMNS
            FROM dbo.documents
            WHERE type = :type
            """.trimIndent(),
        )
            .bind("type", type)
            .map { rs, _ -> mapRowToDocument(rs) }
            .list()

    override fun findById(id: Int): Documents? =
        handle.createQuery(
            """
            SELECT $DOCUMENTS_COLUMNS
            FROM dbo.documents
            WHERE id = :id
            """.trimIndent(),
        )
            .bind("id", id)
            .map { rs, _ -> mapRowToDocument(rs) }
            .singleOrNull()

    override fun findAll(): List<Documents> =
        handle.createQuery(
            """
            SELECT $DOCUMENTS_COLUMNS
            FROM dbo.documents
            ORDER BY id
            """.trimIndent(),
        )
            .map { rs, _ -> mapRowToDocument(rs) }
            .list()

    override fun save(entity: Documents) {
        handle.createUpdate(
            """
            UPDATE dbo.documents
            SET name = :name,
                type = :type,
                file_path = :file_path
            WHERE id = :id
            """.trimIndent(),
        )
            .bind("name", entity.name)
            .bind("type", entity.type)
            .bind("file_path", entity.filepath)
            .bind("id", entity.id)
            .execute()
    }

    override fun deleteById(id: Int) {
        handle.createUpdate("DELETE FROM dbo.documents WHERE id = :id")
            .bind("id", id)
            .execute()
    }

    override fun clear() {
        handle.createUpdate("DELETE FROM dbo.documents").execute()
    }

    private fun mapRowToDocument(rs: ResultSet): Documents =
        Documents(
            id = rs.getInt("id"),
            name = rs.getString("name"),
            type = rs.getString("type"),
            filepath = rs.getString("file_path"),
        )
}
