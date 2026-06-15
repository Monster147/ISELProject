package pt.ira.mem

import com.fasterxml.jackson.databind.JsonNode
import pt.ira.evindence.Evidence
import pt.ira.interfaces.RepositoryOccurrence
import pt.ira.intervenor.Intervenor
import pt.ira.occurrence.Occurrence
import pt.ira.occurrence.OccurrenceType
import java.time.LocalDate

class RepositoryOccurrenceMem : RepositoryOccurrence {
    private val occurrences = mutableListOf<Occurrence>()

    override fun createOccurrence(
        endDate: LocalDate,
        reporterId: Int,
        importance: OccurrenceType,
        occurrenceType: Int,
        occurrenceInfo: JsonNode,
    ): Occurrence =
        Occurrence(
            id = occurrences.size + 1,
            initDate = LocalDate.now(),
            endDate = endDate,
            reporterId = reporterId,
            importance = importance,
            occurrenceType = occurrenceType,
            occurrenceInfo = occurrenceInfo,
        ).also { occurrences.add(it) }

    override fun findByImportance(importance: OccurrenceType): List<Occurrence> = occurrences.filter { it.importance == importance }

    override fun findOccurrenceByReporterId(reporterId: Int): List<Occurrence> = occurrences.filter { it.reporterId == reporterId }

    override fun findByIntervenor(intervenor: Intervenor): List<Occurrence> = occurrences.filter { it.intervenors.contains(intervenor.id) }

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

    override fun findById(id: Int): Occurrence? = occurrences.find { it.id == id }

    override fun findAll(): List<Occurrence> = occurrences.toList()

    override fun save(entity: Occurrence) {
        val idx = occurrences.indexOfFirst { it.id == entity.id }
        if (idx >= 0) {
            occurrences[idx] = entity
        } else {
            occurrences.add(entity)
        }
    }

    override fun deleteById(id: Int) {
        occurrences.removeIf { it.id == id }
    }

    override fun clear() = occurrences.clear()
}
