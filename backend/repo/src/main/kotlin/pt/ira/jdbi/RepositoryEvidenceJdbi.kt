package pt.ira.jdbi

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.JsonNodeFactory
import org.jdbi.v3.core.Handle
import pt.ira.evindence.Evidence
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
        val now = System.currentTimeMillis()
        val id=
            handle.createUpdate(
                """
                INSERT INTO dbo.evidence (type, file_path, location, description, reporter_id, report_id, created_at, updated_at)
                VALUES (:type::jsonb, :file_path, :location, :description, :reporter_id, :report_id, :created_at, :updated_at)
                RETURNING id
                """.trimIndent(),
            )
                .bind("type", type.toString())
                .bind("file_path", filePath)
                .bind("location", location)
                .bind("description", description)
                .bind("reporter_id", reporterId)
                .bind("report_id", reportId)
                .bind("created_at", now)
                .bind("updated_at", now)
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
            createdAt = now,
            updatedAt = now
        )
    }

    override fun findByReportId(reportId: Int): List<Evidence> =
        handle.createQuery(
            """
            SELECT id, type, file_path, location, description, reporter_id, report_id, created_at, updated_at
            FROM dbo.evidence
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
            FROM dbo.evidence
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
            FROM dbo.evidence
            WHERE type = :type::jsonb
            """.trimIndent(),
        )
            .bind("type", type.toString())
            .map { rs, _ -> mapRowToEvidence(rs) }
            .list()

    override fun findByLocation(location: String): List<Evidence> =
        handle.createQuery(
            """
            SELECT id, type, file_path, location, description, reporter_id, report_id, created_at, updated_at
            FROM dbo.evidence
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
            FROM dbo.evidence
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
            FROM dbo.evidence
            ORDER BY id
            """.trimIndent(),
        )
            .map { rs, _ -> mapRowToEvidence(rs) }
            .list()


    override fun save(entity: Evidence) {
        handle.createUpdate(
            """
            UPDATE dbo.evidence
            SET type = :type::jsonb,
                file_path = :file_path,
                location = :location,
                description = :description,
                reporter_id = :reporter_id,
                report_id = :report_id,
                updated_at = :updated_at
            WHERE id = :id
            """.trimIndent(),
        )
            .bind("type", entity.type.toString())
            .bind("file_path", entity.filePath)
            .bind("location", entity.location)
            .bind("description", entity.description)
            .bind("reporter_id", entity.reporterId)
            .bind("report_id", entity.reportId)
            .bind("updated_at", entity.updatedAt)
            .bind("id", entity.id)
            .execute()
    }

    override fun deleteById(id: Int) {
        handle.createUpdate("DELETE FROM dbo.evidence where id=:id")
            .bind("id", id)
            .execute()
    }


    override fun clear() {
        handle.createUpdate("DELETE FROM dbo.evidence").execute()
    }

    private val objectMapper = ObjectMapper()

    private fun mapRowToEvidence(rs: ResultSet): Evidence {
        val id = rs.getInt("id")
        val type = rs.getString("type")
        val filepath = rs.getString("file_path")
        val location = rs.getString("location")
        val description = rs.getString("description")
        val reporterId = rs.getInt("reporter_id")
        val reportId = rs.getInt("report_id")
        val createdAt = rs.getLong("created_at")
        val updatedAt = rs.getLong("updated_at")

        val typeJson = objectMapper.readTree(type)

        return Evidence(
            id = id,
            type = typeJson,
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