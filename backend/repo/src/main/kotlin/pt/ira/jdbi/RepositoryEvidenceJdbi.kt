package pt.ira.jdbi

import com.fasterxml.jackson.databind.JsonNode
import org.jdbi.v3.core.Handle
import pt.ira.Evidence
import pt.ira.interfaces.RepositoryEvidence
import pt.ira.interfaces.RepositoryUser

class RepositoryEvidenceJdbi (
    private val handle: Handle
) : RepositoryEvidence{
    override fun createEvidence(
        type: JsonNode,
        filePath: String,
        location: String,
        description: String,
        reporterId: Int?,
        reportId: Int?
    ): Evidence {
        TODO("Not yet implemented")
    }

    override fun findByReportId(reportId: Int): List<Evidence> {
        TODO("Not yet implemented")
    }

    override fun findByReporterId(reporterId: Int): List<Evidence> {
        TODO("Not yet implemented")
    }

    override fun findByType(type: JsonNode): List<Evidence> {
        TODO("Not yet implemented")
    }

    override fun findByLocation(location: String): List<Evidence> {
        TODO("Not yet implemented")
    }

    override fun findById(id: Int): Evidence? {
        TODO("Not yet implemented")
    }

    override fun findAll(): List<Evidence> {
        TODO("Not yet implemented")
    }

    override fun save(entity: Evidence) {
        TODO("Not yet implemented")
    }

    override fun deleteById(id: Int) {
        TODO("Not yet implemented")
    }

    override fun clear() {
        TODO("Not yet implemented")
    }
}