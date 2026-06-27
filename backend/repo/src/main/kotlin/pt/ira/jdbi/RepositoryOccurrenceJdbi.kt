package pt.ira.jdbi

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.jdbi.v3.core.Handle
import pt.ira.evidence.Evidence
import pt.ira.interfaces.RepositoryOccurrence
import pt.ira.intervenor.Intervenor
import pt.ira.occurrence.Occurrence
import pt.ira.occurrence.OccurrenceType
import java.sql.ResultSet
import java.time.LocalDate

class RepositoryOccurrenceJdbi(
    private val handle: Handle,
) : RepositoryOccurrence {
    private companion object {
        const val OCCURRENCE_COLUMNS = """
            id, 
            initDate, 
            endDate, 
            reporter_id, 
            importance, 
            occur_type, 
            occur_info, 
            evidences, 
            intervenors
            """
        private val objectMapper = ObjectMapper()
    }

    override fun createOccurrence(
        endDate: LocalDate,
        reporterId: Int,
        importance: OccurrenceType,
        occurrenceType: Int,
        occurrenceInfo: JsonNode,
    ): Occurrence {
        val now = LocalDate.now()
        val id =
            handle.createUpdate(
                """
                INSERT INTO dbo.occurrence (initDate, endDate, reporter_id, importance, occur_type, occur_info, evidences, intervenors)
                VALUES (:initDate, :endDate, :reporter_id, :importance::dbo.occurrence_type, :occur_type, :occur_info::jsonb, :evidences, :intervenors)
                RETURNING id
                """.trimIndent(),
            )
                .bind("initDate", now)
                .bind("endDate", endDate)
                .bind("reporter_id", reporterId)
                .bind("importance", importance.name)
                .bind("occur_type", occurrenceType)
                .bind("occur_info", occurrenceInfo.toString())
                .bind("evidences", emptyArray<Int>())
                .bind("intervenors", emptyArray<Int>())
                .executeAndReturnGeneratedKeys()
                .mapTo(Int::class.java)
                .one()

        return Occurrence(
            id = id,
            initDate = now,
            endDate = endDate,
            reporterId = reporterId,
            importance = importance,
            occurrenceType = occurrenceType,
            occurrenceInfo = occurrenceInfo,
        )
    }

    override fun findByImportance(importance: OccurrenceType): List<Occurrence> =
        handle.createQuery(
            """
            SELECT $OCCURRENCE_COLUMNS
            FROM dbo.occurrence
            WHERE importance = :importance::dbo.occurrence_type
            """.trimIndent(),
        )
            .bind("importance", importance.name)
            .map { rs, _ -> mapRowToOccurrence(rs) }
            .toList()

    override fun findOccurrenceByReporterId(reporterId: Int): List<Occurrence> =
        handle.createQuery(
            """
            SELECT $OCCURRENCE_COLUMNS
            FROM dbo.occurrence
            WHERE reporter_id = :reporter_id
            """.trimIndent(),
        )
            .bind("reporter_id", reporterId)
            .map { rs, _ -> mapRowToOccurrence(rs) }
            .toList()

    override fun findByIntervenor(intervenor: Intervenor): List<Occurrence> =
        handle.createQuery(
            """
            SELECT $OCCURRENCE_COLUMNS
            FROM dbo.occurrence
            WHERE :intervenorId = ANY(intervenors)
            """.trimIndent(),
        )
            .bind("intervenorId", intervenor.id)
            .map { rs, _ -> mapRowToOccurrence(rs) }
            .list()

    override fun addIntervenor(
        occurrence: Occurrence,
        intervenor: Intervenor,
    ): Occurrence {
        if (intervenor.id in occurrence.intervenors) return occurrence
        val updated =
            occurrence.copy(
                intervenors = occurrence.intervenors + intervenor.id,
            )
        save(updated)
        return updated
    }

    override fun removeIntervenor(
        occurrence: Occurrence,
        intervenor: Intervenor,
    ): Occurrence {
        if (intervenor.id !in occurrence.intervenors) return occurrence
        val updated =
            occurrence.copy(
                intervenors = occurrence.intervenors - intervenor.id,
            )
        save(updated)
        return updated
    }

    override fun addEvidence(
        occurrence: Occurrence,
        evidence: Evidence,
    ): Occurrence {
        if (evidence.id in occurrence.evidences) return occurrence
        val updated =
            occurrence.copy(
                evidences = occurrence.evidences + evidence.id,
            )
        save(updated)
        return updated
    }

    override fun removeEvidence(
        occurrence: Occurrence,
        evidence: Evidence,
    ): Occurrence {
        if (evidence.id !in occurrence.evidences) return occurrence
        val updated =
            occurrence.copy(
                evidences = occurrence.evidences - evidence.id,
            )
        save(updated)
        return updated
    }

    override fun findById(id: Int): Occurrence? =
        handle.createQuery(
            """
            SELECT $OCCURRENCE_COLUMNS
            FROM dbo.occurrence
            WHERE id = :id
            """.trimIndent(),
        )
            .bind("id", id)
            .map { rs, _ -> mapRowToOccurrence(rs) }
            .singleOrNull()

    override fun findAll(): List<Occurrence> =
        handle.createQuery(
            """
            SELECT $OCCURRENCE_COLUMNS
            FROM dbo.occurrence
            ORDER BY id
            """.trimIndent(),
        )
            .map { rs, _ -> mapRowToOccurrence(rs) }
            .list()

    override fun save(entity: Occurrence) {
        handle.createUpdate(
            """
            UPDATE dbo.occurrence
            SET initDate = :initDate,
                endDate = :endDate,
                reporter_id = :reporter_id,
                importance = :importance::dbo.occurrence_type,
                occur_type = :occur_type,
                occur_info = :occur_info::jsonb,
                evidences = :evidences,
                intervenors = :intervenors
            WHERE id = :id
            """.trimIndent(),
        )
            .bind("id", entity.id)
            .bind("initDate", entity.initDate)
            .bind("endDate", entity.endDate)
            .bind("reporter_id", entity.reporterId)
            .bind("importance", entity.importance.name)
            .bind("occur_type", entity.occurrenceType)
            .bind("occur_info", entity.occurrenceInfo.toString())
            .bind("evidences", entity.evidences.toTypedArray())
            .bind("intervenors", entity.intervenors.toTypedArray())
            .execute()
    }

    override fun deleteById(id: Int) {
        handle.createUpdate("DELETE FROM dbo.occurrence where id=:id")
            .bind("id", id)
            .execute()
    }

    override fun clear() {
        handle.createUpdate("DELETE FROM dbo.occurrence").execute()
    }

    private fun mapRowToOccurrence(rs: ResultSet): Occurrence {
        val evidences =
            rs.getArray("evidences")?.let { arr ->
                (arr.array as Array<*>).map { (it as Number).toInt() }
            } ?: emptyList()
        val intervenors =
            rs.getArray("intervenors")?.let { arr ->
                (arr.array as Array<*>).map { (it as Number).toInt() }
            } ?: emptyList()

        return Occurrence(
            id = rs.getInt("id"),
            initDate = rs.getDate("initDate").toLocalDate(),
            endDate = rs.getDate("endDate").toLocalDate(),
            reporterId = rs.getInt("reporter_id"),
            importance = rs.getString("importance").let { OccurrenceType.valueOf(it) },
            occurrenceType = rs.getInt("occur_type"),
            occurrenceInfo = objectMapper.readTree(rs.getString("occur_info")),
            evidences = evidences,
            intervenors = intervenors,
        )
    }
}
