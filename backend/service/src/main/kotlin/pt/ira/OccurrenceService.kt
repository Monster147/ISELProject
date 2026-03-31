package pt.ira

import org.springframework.stereotype.Component
import pt.ira.interfaces.TransactionManager
import pt.ira.occurrence.Occurrence
import pt.ira.occurrence.OccurrenceType
import pt.ira.report.Report
import java.time.LocalDate
import kotlin.run

sealed class OccurrenceError {
    data object OccurrenceNotFound : OccurrenceError()

    data object EndDateNotValid : OccurrenceError()

    data object UserNotFound : OccurrenceError()

    data object DuplicateUsersIds : OccurrenceError()
}

@Component
class OccurrenceService(
    private val trxManager: TransactionManager,
) {
    fun createOccurrence(
        usersId: List<Int>,
        endDate: LocalDate,
        importance: OccurrenceType = OccurrenceType.NORMAL
    ): Either<OccurrenceError, Occurrence> {
        return trxManager.run {
            if (endDate.isBefore(LocalDate.now())) return@run failure(OccurrenceError.EndDateNotValid)
            if (usersId.distinct().size != usersId.size) return@run failure(OccurrenceError.DuplicateUsersIds)
            val allExist = usersId.all { id -> repoUsers.findById(id) != null }
            if (!allExist) return@run failure(OccurrenceError.UserNotFound)

            val occurrence =
                repoOccurrence.createOccurrence(
                    endDate = endDate,
                    reporterId = usersId,
                    importance = importance
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

    fun findOccurrenceByReporterId(reporterId: Int): List<Occurrence> = trxManager.run { repoOccurrence.findOccurrenceByReporterId(reporterId) }

    fun findAll(): List<Occurrence> = trxManager.run { repoOccurrence.findAll() }

    fun deleteById(id: Int): Either<OccurrenceError, Boolean> {
        return trxManager.run {
            repoOccurrence.findById(id) ?: return@run failure(OccurrenceError.OccurrenceNotFound)
            repoOccurrence.deleteById(id)
            success(true)
        }
    }
}