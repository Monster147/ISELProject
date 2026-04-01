package pt.ira

import com.fasterxml.jackson.databind.JsonNode
import org.springframework.core.io.Resource
import org.springframework.stereotype.Component
import org.springframework.web.multipart.MultipartFile
import pt.ira.storage.StorageService
import pt.ira.evindence.Evidence
import pt.ira.interfaces.TransactionManager

sealed class EvidenceError {
    data object EvidenceNotFound : EvidenceError()

    data object ReportNotFound : EvidenceError()

    data object ReporterNotFound : EvidenceError()

    data object InvalidFile : EvidenceError()

    data object FileNotFound : EvidenceError()
}

@Component
class EvidenceService(
    private val trxManager: TransactionManager,
    private val storageService: StorageService,
) {
    private val allowedExtensions =
        listOf(
            "image/jpg",
            "image/jpeg",
            "image/png",
            "image/heic",
            "application/pdf",
            "video/mp4",
            )

    fun createEvidence(
        type: JsonNode,
        file: MultipartFile,
        location: String,
        description: String,
        reporterId: Int,
        reportId: Int,
    ): Either<EvidenceError, Evidence> {
        return trxManager.run {
            repoUsers.findById(reporterId) ?: return@run failure(EvidenceError.ReporterNotFound)
            repoReport.findById(reportId) ?: return@run failure(EvidenceError.ReportNotFound)
            if(file.isEmpty) return@run failure(EvidenceError.InvalidFile)
            if(file.contentType !in allowedExtensions) return@run failure(EvidenceError.InvalidFile)

            val filePath = storageService.save(reportId, file)

            val evidence =
                repoEvidence.createEvidence(
                    filePath = filePath,
                    location = location,
                    description = description,
                    reporterId = reporterId,
                    reportId = reportId,
                    type = type,
                )
            success(evidence)
        }
    }

    fun downloadEvidence(
        id: Int,
    ) : Either<EvidenceError, Pair<Evidence, Resource>> {
        return trxManager.run {
            val evidence =
                repoEvidence.findById(id)
                    ?: return@run failure(EvidenceError.EvidenceNotFound)

            val resource = storageService.load(evidence.filePath)
                ?: return@run failure(EvidenceError.FileNotFound)

            success(Pair(evidence, resource))
        }
    }

    fun findById(id: Int): Either<EvidenceError, Evidence> {
        return trxManager.run {
            val evidence =
                repoEvidence.findById(id)
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
            val evidence =
                repoEvidence.findById(id)
                    ?: return@run failure(EvidenceError.EvidenceNotFound)

            repoEvidence.deleteById(evidence.id)
            storageService.deleteEvidence(evidence.filePath)
            success(true)
        }
    }
}
