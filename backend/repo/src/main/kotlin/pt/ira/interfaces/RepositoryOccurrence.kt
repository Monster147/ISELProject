package pt.ira.interfaces

import com.fasterxml.jackson.databind.JsonNode
import pt.ira.intervenor.Intervenor
import pt.ira.occurrence.Occurrence
import pt.ira.occurrence.OccurrenceType
import java.time.LocalDate

interface RepositoryOccurrence : Repository<Occurrence> {
    fun createOccurrence(
        endDate: LocalDate,
        reporterId: Int,
        importance: OccurrenceType,
        occurrenceType: JsonNode,
        occurrenceInfo: JsonNode,
    ): Occurrence

    fun findByImportance(importance: OccurrenceType): List<Occurrence>

    fun findOccurrenceByReporterId(reporterId: Int): List<Occurrence>

    fun findByIntervenor(intervenor: Intervenor): List<Occurrence>

    fun addIntervenor(
        occurrence: Occurrence,
        intervenor: Intervenor,
    ): Occurrence

    fun removeIntervenor(
        occurrence: Occurrence,
        intervenor: Intervenor,
    ): Occurrence
}
