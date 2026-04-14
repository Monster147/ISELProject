package pt.ira

import com.fasterxml.jackson.databind.JsonNode
import org.springframework.stereotype.Component
import pt.ira.emitters.ActionKind
import pt.ira.interfaces.TransactionManager
import pt.ira.intervenor.Intervenor
import pt.ira.occurrence.Occurrence
import pt.ira.occurrence.OccurrenceType
import pt.ira.publishers.Publishers
import java.time.LocalDate

sealed class OccurrenceError {
    data object OccurrenceNotFound : OccurrenceError()

    data object EndDateNotValid : OccurrenceError()

    data object UserNotFound : OccurrenceError()

    data object DuplicateUsersIds : OccurrenceError()

    data object IntervenorNotFound : OccurrenceError()

    data object IntervenorAlreadyInOccurrence : OccurrenceError()

    data object IntervenorNotInOccurrence : OccurrenceError()
}

@Component
class OccurrenceService(
    private val trxManager: TransactionManager,
    private val publisher: Publishers,
) {
    fun createOccurrence(
        usersId: Int,
        endDate: LocalDate,
        importance: OccurrenceType = OccurrenceType.NORMAL,
        occurrenceType: JsonNode,
        occurrenceInfo: JsonNode,
    ): Either<OccurrenceError, Occurrence> {
        return trxManager.run {
            if (endDate.isBefore(LocalDate.now())) return@run failure(OccurrenceError.EndDateNotValid)
            repoUsers.findById(usersId) ?: return@run failure(OccurrenceError.UserNotFound)
            val occurrence =
                repoOccurrence.createOccurrence(
                    endDate = endDate,
                    reporterId = usersId,
                    importance = importance,
                    occurrenceType = occurrenceType,
                    occurrenceInfo = occurrenceInfo,
                )
            publisher.occurrencePublisher.sendMessageToAll(
                occurrence.id,
                occurrence,
                ActionKind.OccurrenceCreated
            )
            publisher.occurrencesPublisher.sendMessageToAll(
                findAll(),
                ActionKind.OccurrencesChanged
            )
            success(occurrence)
        }
    }

    fun findById(id: Int): Either<OccurrenceError, Occurrence> {
        return trxManager.run {
            val occurrence =
                repoOccurrence.findById(id)
                    ?: return@run failure(OccurrenceError.OccurrenceNotFound)
            success(occurrence)
        }
    }

    fun findByImportance(importance: OccurrenceType): List<Occurrence> = trxManager.run { repoOccurrence.findByImportance(importance) }

    fun findOccurrenceByReporterId(reporterId: Int): List<Occurrence> =
        trxManager.run {
            repoOccurrence.findOccurrenceByReporterId(
                reporterId,
            )
        }

    fun findByIntervenor(intervenor: Intervenor): List<Occurrence> = trxManager.run { repoOccurrence.findByIntervenor(intervenor) }

    fun addIntervenor(
        occurrenceId: Int,
        intervenorId: Int,
    ): Either<OccurrenceError, Occurrence> {
        return trxManager.run {
            val occurrence =
                repoOccurrence.findById(occurrenceId)
                    ?: return@run failure(OccurrenceError.OccurrenceNotFound)

            val intervenor =
                repoIntervenor.findById(intervenorId)
                    ?: return@run failure(OccurrenceError.IntervenorNotFound)

            if (occurrence.intervenors.any { it == intervenorId }) return@run failure(OccurrenceError.IntervenorAlreadyInOccurrence)


            val updated = repoOccurrence.addIntervenor(occurrence, intervenor)
            publisher.occurrencePublisher.sendMessageToAll(
                updated.id,
                updated,
                ActionKind.IntervenorAdded
            )
            success(updated)
        }
    }

    fun removeIntervenor(
        occurrenceId: Int,
        intervenorId: Int,
    ): Either<OccurrenceError, Occurrence> {
        return trxManager.run {
            val occurrence =
                repoOccurrence.findById(occurrenceId)
                    ?: return@run failure(OccurrenceError.OccurrenceNotFound)

            val intervenor =
                repoIntervenor.findById(intervenorId)
                    ?: return@run failure(OccurrenceError.IntervenorNotFound)

            if (!occurrence.intervenors.any { it == intervenorId }) return@run failure(OccurrenceError.IntervenorNotInOccurrence)

            val updated = repoOccurrence.removeIntervenor(occurrence, intervenor)
            publisher.occurrencePublisher.sendMessageToAll(
                updated.id,
                updated,
                ActionKind.IntervenorRemoved
            )
            success(updated)
        }
    }

    fun findAll(): List<Occurrence> = trxManager.run { repoOccurrence.findAll() }

    fun deleteById(id: Int): Either<OccurrenceError, Boolean> {
        return trxManager.run {
            repoOccurrence.findById(id) ?: return@run failure(OccurrenceError.OccurrenceNotFound)
            repoOccurrence.deleteById(id)
            publisher.occurrencePublisher.sendMessageToAll(
                id,
                Unit,
                ActionKind.OccurrenceDeleted
            )
            publisher.occurrencesPublisher.sendMessageToAll(
                findAll(),
                ActionKind.OccurrencesChanged
            )
            success(true)
        }
    }
}
