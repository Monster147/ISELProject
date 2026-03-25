package pt.ira

import com.fasterxml.jackson.databind.JsonNode
import org.springframework.stereotype.Component
import pt.ira.evindence.Evidence
import pt.ira.interfaces.TransactionManager

sealed class EvidenceError {
    data object EvidenceAlreadyExists : EvidenceError()

    data object EvidenceNotFound : EvidenceError()
}

@Component
class EvidenceService(
    private val trxManager: TransactionManager,
)  {

    fun createEvidence(
        type: JsonNode,
        filePath: String,
        location: String,
        description: String,
        reporterId: Int,
        reportId: Int
    ): Either<EvidenceError, Evidence> {
        return trxManager.run{
            // Tipo de Verificação?
            val evidence = repoEvidence.createEvidence(
                filePath = filePath,
                location = location,
                description = description,
                reporterId = reporterId,
                reportId = reportId,
                type = type
            )
            success(evidence)
        }
    }

    fun findById(id: Int): Either<EvidenceError, Evidence> {
        return trxManager.run {
            val evidence = repoEvidence.findById(id)
                ?: return@run failure(EvidenceError.EvidenceNotFound)
            success(evidence)
        }
    }

    fun findByReportId(reportId: Int): List<Evidence> {
        return trxManager.run {
            repoEvidence.findByReportId(reportId)
        }
    }

    fun findByReporterId(reporterId: Int): List<Evidence> {
        return trxManager.run {
            repoEvidence.findByReporterId(reporterId)
        }
    }

    fun findByType(type: JsonNode): List<Evidence> {
        return trxManager.run {
            repoEvidence.findByType(type)
        }
    }

    fun findByLocation(location: String): List<Evidence> {
        return trxManager.run {
            repoEvidence.findByLocation(location)
        }
    }

    fun findAll(): List<Evidence> {
        return trxManager.run {
            repoEvidence.findAll()
        }
    }

    fun deleteById(id: Int): Either<EvidenceError, Boolean> {
        return trxManager.run {
            val evidence = repoEvidence.findById(id)
                ?: return@run failure(EvidenceError.EvidenceNotFound)

            repoEvidence.deleteById(evidence.id)
            success(true)
        }
    }
}