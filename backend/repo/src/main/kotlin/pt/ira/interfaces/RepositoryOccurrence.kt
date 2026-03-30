package pt.ira.interfaces

import pt.ira.occurrence.Occurrence
import pt.ira.occurrence.OccurrenceType
import java.time.LocalDate

interface RepositoryOccurrence: Repository<Occurrence> {
    fun createOccurrence(
        endDate: LocalDate,
        reporterId: List<Int>,
        importance: OccurrenceType,
    ): Occurrence

    fun findByImportance(importance: OccurrenceType): List<Occurrence>

    fun findOccurrenceByReporterId(reporterId: Int): List<Occurrence>
}