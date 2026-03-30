package pt.ira.jdbi

import org.jdbi.v3.core.Handle
import pt.ira.interfaces.RepositoryOccurrence
import pt.ira.occurrence.Occurrence
import pt.ira.occurrence.OccurrenceType

import java.sql.Date
import java.sql.ResultSet
import java.time.LocalDate

class RepositoryOccurrenceJdbi(
    private val handle: Handle,
): RepositoryOccurrence {
    override fun createOccurrence(
        endDate: LocalDate,
        reporterId: List<Int>,
        importance: OccurrenceType
    ): Occurrence {
        val now = LocalDate.now()
        val id =
            handle.createUpdate(
                """
                INSERT INTO dbo.occurrence (initDate, endDate, reporter_id, importance) 
                VALUES (:initDate, :endDate, :reporter_id, :importance::dbo.occurrence_type)
                RETURNING id
                """.trimIndent(),
            )
                .bind("initDate", now)
                .bind("endDate", endDate)
                .bind("reporter_id", reporterId.toTypedArray())
                .bind("importance", importance.name)
                .executeAndReturnGeneratedKeys()
                .mapTo(Int::class.java)
                .one()

        return Occurrence(
            id = id,
            initDate = now,
            endDate = endDate,
            reporterId = reporterId,
            importance = importance
        )
    }

    override fun findByImportance(importance: OccurrenceType): List<Occurrence> =
        handle.createQuery(
            """
            SELECT id, initDate, endDate, reporter_id, importance
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
            SELECT id, initDate, endDate, reporter_id, importance
            FROM dbo.occurrence
             WHERE :reporter_id = ANY(reporter_id)
            """.trimIndent(),
        )
            .bind("reporter_id", reporterId)
            .map { rs, _ -> mapRowToOccurrence(rs) }
            .toList()

    override fun findById(id: Int): Occurrence? =
        handle.createQuery(
            """
            SELECT id, initDate, endDate, reporter_id, importance
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
            SELECT id, initDate, endDate, reporter_id, importance
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
                importance = :importance::dbo.occurrence_type
            WHERE id = :id
            """.trimIndent(),
        )
            .bind("id", entity.id)
            .bind("initDate", entity.initDate)
            .bind("endDate", entity.endDate)
            .bind("reporter_id", entity.reporterId.toTypedArray())
            .bind("importance", entity.importance.name)
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
        val id = rs.getInt("id")
        val reporterId = rs.getArray("reporter_id")?.let { arr ->
            (arr.array as Array<*>).map { (it as Number).toInt() }
        } ?: emptyList()
        val importance = rs.getString("importance").let { OccurrenceType.valueOf(it) }
        val initDate = rs.getDate("initDate").toLocalDate()
        val endDate = rs.getDate("endDate").toLocalDate()

        return Occurrence(
            id = id,
            initDate = initDate,
            endDate = endDate,
            reporterId = reporterId,
            importance = importance
        )
    }
}