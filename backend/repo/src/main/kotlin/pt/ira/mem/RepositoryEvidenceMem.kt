package pt.ira.mem

import com.fasterxml.jackson.databind.JsonNode
import pt.ira.evindence.Evidence
import pt.ira.interfaces.RepositoryEvidence

class RepositoryEvidenceMem: RepositoryEvidence {
    private val evidences = mutableListOf<Evidence>()

    override fun createEvidence(
        type: JsonNode,
        filePath: String,
        location: String,
        description: String,
        reporterId: Int,
        reportId: Int
    ): Evidence = Evidence(
        id = evidences.size + 1,
        type = type,
        filePath = filePath,
        location = location,
        description = description,
        reporterId = reporterId,
        reportId = reportId
    ).also { evidences.add(it) }

    override fun findByReportId(reportId: Int): List<Evidence> = evidences.filter { it.reportId == reportId }

    override fun findByReporterId(reporterId: Int): List<Evidence> = evidences.filter { it.reporterId == reporterId }

    override fun findByType(type: JsonNode): List<Evidence> = evidences.filter { it.type == type }

    override fun findByLocation(location: String): List<Evidence> = evidences.filter { it.location == location }

    override fun findById(id: Int): Evidence? = evidences.find { it.id == id }

    override fun findAll(): List<Evidence> = evidences.toList()

    override fun save(entity: Evidence) {
        evidences.removeIf { it.id == entity.id }
        evidences.add(entity)
    }

    override fun deleteById(id: Int) {
        evidences.removeIf { it.id == id }
    }

    override fun clear() {
        evidences.clear()
    }
}