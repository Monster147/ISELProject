package pt.ira.jdbi

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.jdbi.v3.core.Handle
import pt.ira.interfaces.RepositoryReport
import pt.ira.report.Report
import pt.ira.report.ReportStatus
import pt.ira.user.User
import java.sql.ResultSet

class RepositoryReportJdbi(
    private val handle: Handle,
) : RepositoryReport {
    override fun createReport(
        creatorId: Int,
        occurrenceId: Int,
        title: String,
        description: String,
        type: JsonNode,
        addons: JsonNode,
        intervenors: List<Int>,
    ): Report {
        val now = System.currentTimeMillis()
        val id =
            handle.createUpdate(
                """
                INSERT INTO dbo.report (creator_id, occurrence_id ,title, description, status, type, addons, editors, intervenors, created_at, updated_at) 
                VALUES (:creator_id, :occurrence_id, :title, :description, :status::dbo.report_status, :type::jsonb, :addons::jsonb, :editors, :intervenors, :created_at, :updated_at)
                RETURNING id
                """.trimIndent(),
            )
                .bind("creator_id", creatorId)
                .bind("occurrence_id", occurrenceId)
                .bind("title", title)
                .bind("description", description)
                .bind("status", ReportStatus.EDITING.name)
                .bind("type", type.toString())
                .bind("addons", addons.toString())
                .bind("editors", arrayOf(creatorId))
                .bind("intervenors", intervenors.toTypedArray())
                .bind("created_at", now)
                .bind("updated_at", now)
                .executeAndReturnGeneratedKeys()
                .mapTo(Int::class.java)
                .one()

        return Report(
            id = id,
            creatorId = creatorId,
            occurrenceId = occurrenceId,
            title = title,
            description = description,
            status = ReportStatus.EDITING,
            type = type,
            addons = addons,
            createdAt = now,
            updatedAt = now,
            editors = listOf(creatorId),
            intervenors = intervenors,
        )
    }

    override fun findByOccurrenceId(occurrenceId: Int): Report? =
        handle.createQuery(
            """
            SELECT id, creator_id, occurrence_id, title, description, status, type, addons, created_at, updated_at, editors, intervenors
            FROM dbo.report
            WHERE occurrence_id = :occurrenceId
            """.trimIndent(),
        )
            .bind("occurrenceId", occurrenceId)
            .map { rs, _ -> mapRowToReport(rs) }
            .singleOrNull()

    override fun findByStatus(status: ReportStatus): List<Report> =
        handle.createQuery(
            """
            SELECT id, creator_id, occurrence_id, title, description, status, type, addons, created_at, updated_at, editors, intervenors
            FROM dbo.report
            WHERE status = :status::dbo.report_status
            """.trimIndent(),
        )
            .bind("status", status.name)
            .map { rs, _ -> mapRowToReport(rs) }
            .toList()

    override fun findByCreatorId(creatorId: Int): List<Report> =
        handle.createQuery(
            """
            SELECT id, creator_id, occurrence_id, title, description, status, type, addons, created_at, updated_at, editors, intervenors
            FROM dbo.report
            WHERE creator_id = :creatorId
            """.trimIndent(),
        )
            .bind("creatorId", creatorId)
            .map { rs, _ -> mapRowToReport(rs) }
            .toList()

    override fun findByEditor(userId: Int): List<Report> =
        handle.createQuery(
            """
            SELECT id, creator_id, occurrence_id, title, description, status, type, addons, created_at, updated_at, editors, intervenors
            FROM dbo.report
             WHERE :editors = ANY(editors)
            """.trimIndent(),
        )
            .bind("editors", userId)
            .map { rs, _ -> mapRowToReport(rs) }
            .toList()

    override fun addEditor(
        report: Report,
        user: User,
    ): Report {
        if (report.editors.any { it == user.id }) return report
        val updated =
            report.copy(
                editors = report.editors + user.id,
                updatedAt = System.currentTimeMillis(),
            )
        save(updated)
        return updated
    }

    override fun removeEditor(
        report: Report,
        user: User,
    ): Report {
        if (report.editors.none { it == user.id }) return report
        val updatedReport =
            report.copy(
                editors = report.editors - user.id,
                updatedAt = System.currentTimeMillis(),
            )
        save(updatedReport)
        return updatedReport
    }

    override fun updateStatus(
        report: Report,
        status: ReportStatus,
    ): Report {
        val updatedReport = report.copy(status = status, updatedAt = System.currentTimeMillis())
        save(updatedReport)
        return updatedReport
    }

    override fun findByType(type: JsonNode): List<Report> =
        handle.createQuery(
            """
            SELECT id, creator_id, occurrence_id, title, description, status, type, addons, created_at, updated_at, editors, intervenors
            FROM dbo.report
            WHERE type = :type::jsonb
            """.trimIndent(),
        )
            .bind("type", type.toString())
            .map { rs, _ -> mapRowToReport(rs) }
            .list()

    override fun findById(id: Int): Report? =
        handle.createQuery(
            """
            SELECT id, creator_id, occurrence_id,title, description, status, type, addons, created_at, updated_at, editors, intervenors
            FROM dbo.report
            WHERE id = :id
            """.trimIndent(),
        )
            .bind("id", id)
            .map { rs, _ -> mapRowToReport(rs) }
            .singleOrNull()

    override fun findAll(): List<Report> =
        handle.createQuery(
            """
            SELECT id, creator_id, occurrence_id, title, description, status, type, addons, created_at, updated_at, editors, intervenors
            FROM dbo.report
            ORDER BY id
            """.trimIndent(),
        )
            .map { rs, _ -> mapRowToReport(rs) }
            .list()

    override fun save(entity: Report) {
        handle.createUpdate(
            """
            UPDATE dbo.report
            SET creator_id = :creatorId,
                occurrence_id = :occurrence_id,
                title = :title,
                description = :description,
                status = :status::dbo.report_status,
                type = :type::jsonb,
                addons = :addons::jsonb,
                updated_at = :updated_at,
                editors = :editors, 
                intervenors = :intervenors
            WHERE id = :id
            """.trimIndent(),
        )
            .bind("id", entity.id)
            .bind("creatorId", entity.creatorId)
            .bind("occurrence_id", entity.occurrenceId)
            .bind("title", entity.title)
            .bind("description", entity.description)
            .bind("status", entity.status.name)
            .bind("type", entity.type.toString())
            .bind("addons", entity.addons.toString())
            .bind("editors", entity.editors.toTypedArray())
            .bind("intervenors", entity.intervenors.toTypedArray())
            .bind("updated_at", entity.updatedAt)
            .execute()
    }

    override fun deleteById(id: Int) {
        handle.createUpdate("DELETE FROM dbo.report where id=:id")
            .bind("id", id)
            .execute()
    }

    override fun clear() {
        handle.createUpdate("DELETE FROM dbo.report").execute()
    }

    private val objectMapper = ObjectMapper()

    private fun mapRowToReport(rs: ResultSet): Report {
        val id = rs.getInt("id")
        val creatorId = rs.getInt("creator_id")
        val occurrenceId = rs.getInt("occurrence_id")
        val title = rs.getString("title")
        val description = rs.getString("description")
        val status = rs.getString("status").let { ReportStatus.valueOf(it) }
        val type = rs.getString("type")
        val addons = rs.getString("addons")
        val createdAt = rs.getLong("created_at")
        val updatedAt = rs.getLong("updated_at")
        val editors =
            rs.getArray("editors")?.let { arr ->
                (arr.array as Array<*>).map { (it as Number).toInt() }
            } ?: emptyList()

        val typeJson = objectMapper.readTree(type)
        val addonsJson = objectMapper.readTree(addons)

        val intervenors =
            rs.getArray("intervenors")?.let { arr ->
                (arr.array as Array<*>).map { (it as Number).toInt() }
            } ?: emptyList()

        return Report(
            id = id,
            creatorId = creatorId,
            occurrenceId = occurrenceId,
            title = title,
            description = description,
            status = status,
            type = typeJson,
            addons = addonsJson,
            createdAt = createdAt,
            updatedAt = updatedAt,
            editors = editors,
            intervenors = intervenors,
        )
    }
}
