package pt.ira.mem

import pt.ira.interfaces.RepositoryOccurrence
import pt.ira.occurrence.Occurrence
import pt.ira.occurrence.OccurrenceType
import java.sql.Date
import java.time.LocalDate

class RepositoryOccurrenceMem: RepositoryOccurrence {
    val occurrences = mutableListOf<Occurrence>()

    override fun createOccurrence(
        endDate: LocalDate,
        reporterId: List<Int>,
        importance: OccurrenceType
    ): Occurrence =
        Occurrence(
            id = occurrences.size + 1,
            initDate = LocalDate.now(),
            endDate = endDate,
            reporterId = reporterId,
            importance = importance,
        ).also { occurrences.add(it) }

    override fun findByImportance(importance: OccurrenceType): List<Occurrence> = occurrences.filter { it.importance == importance }

    override fun findOccurrenceByReporterId(reporterId: Int): List<Occurrence> = occurrences.filter { it.reporterId.contains(reporterId)}

    override fun findById(id: Int): Occurrence? = occurrences.find { it.id == id }

    override fun findAll(): List<Occurrence> = occurrences.toList()

    override fun save(entity: Occurrence) {
        occurrences.removeIf { it.id == entity.id }
        occurrences.add(entity)
    }

    override fun deleteById(id: Int) {
        occurrences.removeIf { it.id == id }
    }

    override fun clear() {
        occurrences.clear()
    }
}