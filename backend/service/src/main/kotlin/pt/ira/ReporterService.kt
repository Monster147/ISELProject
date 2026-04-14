package pt.ira

import com.fasterxml.jackson.databind.JsonNode
import org.springframework.stereotype.Component
import pt.ira.emitters.ActionKind
import pt.ira.interfaces.TransactionManager
import pt.ira.publishers.Publishers
import pt.ira.report.Report
import pt.ira.report.ReportStatus
import pt.ira.storage.StorageService

sealed class ReportError {
    data object ReportNotFound : ReportError()

    data object UserNotFound : ReportError()

    data object IntervenorNotFound : ReportError()

    data object OccurrenceNotFound : ReportError()

    data object OccurrenceNotAssignedToUser : ReportError()

    data object OccurrenceAlreadyHasReport : ReportError()
}

@Component
class ReportService(
    private val trxManager: TransactionManager,
    private val publisher: Publishers
) {
    fun createReport(
        creatorId: Int,
        occurrenceId: Int,
        title: String,
        description: String,
        addons: JsonNode,
    ): Either<ReportError, Report> {
        return trxManager.run {
            repoUsers.findById(creatorId) ?: return@run failure(ReportError.UserNotFound)
            val occurrence = repoOccurrence.findById(occurrenceId) ?: return@run failure(ReportError.OccurrenceNotFound)
            val existingReport = repoReport.findByOccurrenceId(occurrenceId)
            if (existingReport != null) {
                return@run failure(ReportError.OccurrenceAlreadyHasReport)
            }
            if (occurrence.reporterId != creatorId) {
                return@run failure(ReportError.OccurrenceNotAssignedToUser)
            }
            val report =
                repoReport.createReport(
                    creatorId = creatorId,
                    occurrenceId = occurrenceId,
                    title = title,
                    description = description,
                    type = occurrence.occurrenceType,
                    addons = addons,
                    intervenors = occurrence.intervenors,
                )
            publisher.reportPublisher.sendMessageToAll(
                report.id,
                report,
                ActionKind.ReportCreated
            )
            success(report)
        }
    }

    fun findById(id: Int): Either<ReportError, Report> {
        return trxManager.run {
            val report =
                repoReport.findById(id)
                    ?: return@run failure(ReportError.ReportNotFound)
            success(report)
        }
    }

    fun findByStatus(status: ReportStatus): List<Report> = trxManager.run { repoReport.findByStatus(status) }

    fun findByCreatorId(creatorId: Int): List<Report> = trxManager.run { repoReport.findByCreatorId(creatorId) }

    fun findByEditor(userId: Int): List<Report> = trxManager.run { repoReport.findByEditor(userId) }

    fun findByType(type: JsonNode): List<Report> = trxManager.run { repoReport.findByType(type) }

    fun findAll(): List<Report> = trxManager.run { repoReport.findAll() }

    fun addEditor(
        reportId: Int,
        userId: Int,
    ): Either<ReportError, Report> {
        return trxManager.run {
            val report =
                repoReport.findById(reportId)
                    ?: return@run failure(ReportError.ReportNotFound)

            val user =
                repoUsers.findById(userId)
                    ?: return@run failure(ReportError.UserNotFound)

            val updated = repoReport.addEditor(report, user)
            publisher.reportPublisher.sendMessageToAll(
                updated.id,
                updated,
                ActionKind.EditorAdded
            )
            success(updated)
        }
    }

    fun removeEditor(
        reportId: Int,
        userId: Int,
    ): Either<ReportError, Report> {
        return trxManager.run {
            val report =
                repoReport.findById(reportId)
                    ?: return@run failure(ReportError.ReportNotFound)

            val user =
                repoUsers.findById(userId)
                    ?: return@run failure(ReportError.UserNotFound)

            val updated = repoReport.removeEditor(report, user)
            publisher.reportPublisher.sendMessageToAll(
                updated.id,
                updated,
                ActionKind.EditorRemoved
            )
            success(updated)
        }
    }

    fun updateStatus(
        reportId: Int,
        status: ReportStatus,
    ): Either<ReportError, Report> {
        return trxManager.run {
            val report =
                repoReport.findById(reportId)
                    ?: return@run failure(ReportError.ReportNotFound)

            val updated = repoReport.updateStatus(report, status)
            publisher.reportPublisher.sendMessageToAll(
                updated.id,
                updated,
                ActionKind.ReportStatusChanged
            )
            success(updated)
        }
    }

    fun deleteById(id: Int): Either<ReportError, Boolean> { // Boolean or Unit
        return trxManager.run {
            val report =
                repoReport.findById(id)
                    ?: return@run failure(ReportError.ReportNotFound)

            repoReport.deleteById(report.id)
            publisher.reportPublisher.sendMessageToAll(
                report.id,
                Unit,
                ActionKind.ReportDeleted
            )
            success(true)
        }
    }
}
