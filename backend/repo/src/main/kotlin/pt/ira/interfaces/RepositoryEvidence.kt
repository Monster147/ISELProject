package pt.ira.interfaces

import com.fasterxml.jackson.databind.JsonNode
import pt.ira.evindence.Evidence

interface RepositoryEvidence : Repository<Evidence> {
    fun createEvidence(
        type: JsonNode,
        filePath: String,
        location: String,
        description: String,
        reporterId: Int,
        occurrenceId: Int,
    ): Evidence

    fun findByOccurrenceId(occurrenceId: Int): List<Evidence>

    fun findByReporterId(reporterId: Int): List<Evidence>

    fun findByType(type: JsonNode): List<Evidence>

    fun findByLocation(location: String): List<Evidence>
}
