package pt.ira.jdbi

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.JsonNodeFactory
import org.jdbi.v3.core.Handle
import pt.ira.Evidence
import pt.ira.interfaces.RepositoryEvidence
import java.sql.ResultSet

class RepositoryEvidenceJdbi (
    private val handle: Handle
) : RepositoryEvidence{
    override fun createEvidence(
        type: JsonNode,
        filePath: String,
        location: String,
        description: String,
        reporterId: Int,
        reportId: Int
    ): Evidence {
        val id=
            handle.createUpdate(
                """
                INSERT INTO dbo.evidence (type, file_path, location, description, reporter_id, report_id) 
                VALUES (:type, :file_path, :location, :description, :reporter_id, :report_id)
                RETURNING id
                """.trimIndent(),
            )
                .bind("type", type.asText())
                .bind("file_path", filePath)
                .bind("location", location)
                .bind("description", description)
                .bind("reporter_id", reporterId)
                .bind("report_id", reportId)
                .executeAndReturnGeneratedKeys()
                .mapTo(Int::class.java)
                .one()

        return Evidence(
            id = id,
            type = type,
            filePath = filePath,
            location = location,
            description = description,
            reporterId = reporterId,
            reportId = reportId,
            createdAt = System.currentTimeMillis(),
            updatedAt = System.currentTimeMillis()
        )
    }

    override fun findByReportId(reportId: Int): List<Evidence> =
        handle.createQuery(
            """
            SELECT id, type, file_path, location, description, reporter_id, report_id, created_at, updated_at
            FROM dbo.report
            WHERE report_id = :report_id
            """.trimIndent(),
        )
            .bind("report_id", reportId)
            .map { rs, _ -> mapRowToEvidence(rs) }
            .list()

    override fun findByReporterId(reporterId: Int): List<Evidence> =
        handle.createQuery(
            """
            SELECT id, type, file_path, location, description, reporter_id, report_id, created_at, updated_at
            FROM dbo.report
            WHERE reporter_id = :reporter_id
            """.trimIndent(),
        )
            .bind("reporter_id", reporterId)
            .map { rs, _ -> mapRowToEvidence(rs) }
            .list()

    override fun findByType(type: JsonNode): List<Evidence> =
        handle.createQuery(
            """
            SELECT id, type, file_path, location, description, reporter_id, report_id, created_at, updated_at
            FROM dbo.report
            WHERE type = :type
            """.trimIndent(),
        )
            .bind("type", type.asText())
            .map { rs, _ -> mapRowToEvidence(rs) }
            .list()

    override fun findByLocation(location: String): List<Evidence> =
        handle.createQuery(
            """
            SELECT id, type, file_path, location, description, reporter_id, report_id, created_at, updated_at
            FROM dbo.report
            WHERE location = :location
            """.trimIndent(),
        )
            .bind("location", location)
            .map { rs, _ -> mapRowToEvidence(rs) }
            .list()

    override fun findById(id: Int): Evidence? =
        handle.createQuery(
            """
            SELECT id, type, file_path, location, description, reporter_id, report_id, created_at, updated_at
            FROM dbo.report
            WHERE id = :id
            """.trimIndent(),
        )
            .bind("id", id)
            .map { rs, _ -> mapRowToEvidence(rs) }
            .singleOrNull()


    override fun findAll(): List<Evidence> =
        handle.createQuery(
            """
            SELECT id, type, file_path, location, description, reporter_id, report_id, created_at, updated_at
            FROM dbo.intervenor
            ORDER BY id
            """.trimIndent(),
        )
            .map { rs, _ -> mapRowToEvidence(rs) }
            .list()


    override fun save(entity: Evidence) {
        handle.createUpdate(
            """
            UPDATE dbo.intervenor
            SET type = :type,
                file_path = :title,
                location = :location,
                description = :description,
                reporter_id = :reporter_id,
                report_id = :report_id,
                created_at = :created_at,
                updated_at = :updated_at,
            WHERE id = :id
            """.trimIndent(),
        )
            .bind("type", entity.type)
            .bind("file_path", entity.filePath)
            .bind("location", entity.location)
            .bind("description", entity.description)
            .bind("reporter_id", entity.reporterId)
            .bind("report_id", entity.reportId)
            .bind("created_at", entity.createdAt)
            .bind("updated_at", entity.updatedAt)
            .execute()
    }

    override fun deleteById(id: Int) {
        handle.createUpdate("DELETE FROM dbo.evidence where id=$id")
            .bind("id", id)
            .execute()
    }


    override fun clear() {
        handle.createUpdate("DELETE FROM dbo.evidence").execute()
    }

    private fun mapRowToEvidence(rs: ResultSet): Evidence {
        val id = rs.getInt("id")
        val type = rs.getString("type")
        val filepath = rs.getString("filePath")
        val location = rs.getString("location")
        val description = rs.getString("description")
        val reporterId = rs.getInt("reporterId")
        val reportId = rs.getInt("reportId")
        val createdAt = rs.getTimestamp("created_at").time
        val updatedAt = rs.getTimestamp("updated_at").time


        return Evidence(
            id = id,
            type = JsonNodeFactory.instance.textNode(type),
            filePath = filepath,
            location = location,
            description = description,
            reporterId = reporterId,
            reportId = reportId,
            createdAt = createdAt,
            updatedAt = updatedAt,
        )
    }
}