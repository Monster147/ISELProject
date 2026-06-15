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
    private companion object {
        const val REPORT_COLUMNS = """
            id,
            creator_id, 
            occurrence_id, 
            title, 
            description, 
            status, 
            type, 
            addons, 
            created_at, 
            updated_at, 
            editors, 
            intervenors, 
            language, 
            file_path
            """
        private val objectMapper = ObjectMapper()
    }

    override fun createReport(
        creatorId: Int,
        occurrenceId: Int,
        title: String,
        description: String,
        type: Int,
        addons: JsonNode,
        intervenors: List<Int>,
        language: String,
        filePath: String,
    ): Report {
        val now = System.currentTimeMillis()
        val id =
            handle.createUpdate(
                """
                INSERT INTO dbo.report (creator_id, occurrence_id ,title, description, status, type, addons, editors, intervenors, created_at, updated_at, language, file_path) 
                VALUES (:creator_id, :occurrence_id, :title, :description, :status::dbo.report_status, :type, :addons::jsonb, :editors, :intervenors, :created_at, :updated_at, :language, :file_path)
                RETURNING id
                """.trimIndent(),
            )
                .bind("creator_id", creatorId)
                .bind("occurrence_id", occurrenceId)
                .bind("title", title)
                .bind("description", description)
                .bind("status", ReportStatus.EDITING.name)
                .bind("type", type)
                .bind("addons", addons.toString())
                .bind("editors", arrayOf(creatorId))
                .bind("intervenors", intervenors.toTypedArray())
                .bind("created_at", now)
                .bind("updated_at", now)
                .bind("language", language)
                .bind("file_path", filePath)
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
            language = language,
            filePath = filePath,
        )
    }

    override fun findByOccurrenceId(occurrenceId: Int): Report? =
        handle.createQuery(
            """
            SELECT $REPORT_COLUMNS
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
            SELECT $REPORT_COLUMNS
            FROM dbo.report
            WHERE status = :status::dbo.report_status
            """.trimIndent(),
        )
            .bind("status", status.name)
            .map { rs, _ -> mapRowToReport(rs) }
            .list()

    override fun findByCreatorId(creatorId: Int): List<Report> =
        handle.createQuery(
            """
            SELECT $REPORT_COLUMNS
            FROM dbo.report
            WHERE creator_id = :creatorId
            """.trimIndent(),
        )
            .bind("creatorId", creatorId)
            .map { rs, _ -> mapRowToReport(rs) }
            .list()

    override fun findByEditor(userId: Int): List<Report> =
        handle.createQuery(
            """
            SELECT $REPORT_COLUMNS
            FROM dbo.report
             WHERE :editors = ANY(editors)
            """.trimIndent(),
        )
            .bind("editors", userId)
            .map { rs, _ -> mapRowToReport(rs) }
            .list()

    override fun addEditor(
        report: Report,
        user: User,
    ): Report {
        if (user.id in report.editors) return report
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
        if (user.id !in report.editors) return report
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
        if (status == report.status) return report
        val updatedReport = report.copy(status = status, updatedAt = System.currentTimeMillis())
        save(updatedReport)
        return updatedReport
    }

    override fun findByType(type: Int): List<Report> =
        handle.createQuery(
            """
            SELECT $REPORT_COLUMNS
            FROM dbo.report
            WHERE type = :type
            """.trimIndent(),
        )
            .bind("type", type)
            .map { rs, _ -> mapRowToReport(rs) }
            .list()

    override fun findById(id: Int): Report? =
        handle.createQuery(
            """
            SELECT $REPORT_COLUMNS
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
            SELECT $REPORT_COLUMNS
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
                type = :type,
                addons = :addons::jsonb,
                updated_at = :updated_at,
                editors = :editors, 
                intervenors = :intervenors, 
                language = :language,
                file_path = :file_path
            WHERE id = :id
            """.trimIndent(),
        )
            .bind("id", entity.id)
            .bind("creatorId", entity.creatorId)
            .bind("occurrence_id", entity.occurrenceId)
            .bind("title", entity.title)
            .bind("description", entity.description)
            .bind("status", entity.status.name)
            .bind("type", entity.type)
            .bind("addons", entity.addons.toString())
            .bind("editors", entity.editors.toTypedArray())
            .bind("intervenors", entity.intervenors.toTypedArray())
            .bind("updated_at", entity.updatedAt)
            .bind("language", entity.language)
            .bind("file_path", entity.filePath)
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

    private fun mapRowToReport(rs: ResultSet): Report {
        val editors =
            rs.getArray("editors")?.let { arr ->
                (arr.array as Array<*>).map { (it as Number).toInt() }
            } ?: emptyList()

        val intervenors =
            rs.getArray("intervenors")?.let { arr ->
                (arr.array as Array<*>).map { (it as Number).toInt() }
            } ?: emptyList()

        return Report(
            id = rs.getInt("id"),
            creatorId = rs.getInt("creator_id"),
            occurrenceId = rs.getInt("occurrence_id"),
            title = rs.getString("title"),
            description = rs.getString("description"),
            status = rs.getString("status").let { ReportStatus.valueOf(it) },
            type = rs.getInt("type"),
            addons = objectMapper.readTree(rs.getString("addons")),
            createdAt = rs.getLong("created_at"),
            updatedAt = rs.getLong("updated_at"),
            editors = editors,
            intervenors = intervenors,
            language = rs.getString("language"),
            filePath = rs.getString("file_path"),
        )
    }
}
