package pt.ira

import com.fasterxml.jackson.databind.JsonNode
import org.springframework.stereotype.Component
import pt.ira.emitters.ActionKind
import pt.ira.interfaces.TransactionManager
import pt.ira.intervenor.Intervenor
import pt.ira.intervenor.IntervenorAddResult
import pt.ira.intervenor.IntervenorRemoveResult
import pt.ira.occurrence.Occurrence
import pt.ira.occurrence.OccurrenceCreatedResult
import pt.ira.occurrence.OccurrenceDeleteResult
import pt.ira.occurrence.OccurrenceType
import pt.ira.publishers.Publishers
import java.time.LocalDate

/**
 * Hierarquia de erros específicos do domínio das ocorrências.
 *
 * Encapsula as situações de erro que podem ocorrer durante operações com ocorrências,
 * permitindo um tratamento explícito e tipificado dos cenários de falha.
 *
 * @see OccurrenceService
 */
sealed class OccurrenceError {
    /**
     * A ocorrência solicitada não foi encontrada.
     */
    data object OccurrenceNotFound : OccurrenceError()

    /**
     *  A data de fim da ocorrência é inválida (anterior à data atual).
     */
    data object EndDateNotValid : OccurrenceError()

    /**
     * O utilizador (reporter) solicitado não existe.
     */
    data object UserNotFound : OccurrenceError()

    /**
     * A lista de identificadores de utilizadores contém duplicados.
     */
    data object DuplicateUsersIds : OccurrenceError()

    /**
     * O interveniente solicitado não existe.
     */
    data object IntervenorNotFound : OccurrenceError()

    /**
     * O interveniente já está associado à ocorrência.
     */
    data object IntervenorAlreadyInOccurrence : OccurrenceError()

    /**
     * O interveniente não está associado à ocorrência.
     */
    data object IntervenorNotInOccurrence : OccurrenceError()

    /**
     * O tipo de ocorrência solicitado não existe.
     */
    data object TypeNotFound : OccurrenceError()
}

/**
 * Serviço responsável pela gestão do ciclo de vida das ocorrências.
 *
 * Responsabilidades principais:
 * - criação, consulta e eliminação de ocorrências;
 * - validação de utilizadores e dados temporais;
 * - gestão de associação de intervenientes a ocorrências;
 * - publicação de eventos relacionados com alterações de ocorrências.
 *
 * @param trxManager gestor de transações usado para aceder aos repositórios dentro de unidades de trabalho.
 * @param publisher conjunto de publicadores de eventos do sistema.
 */
@Component
class OccurrenceService(
    private val trxManager: TransactionManager,
    private val publisher: Publishers,
) {
    /**
     * Cria uma ocorrência.
     *
     * Valida a data de fim e a existência do utilizador.
     * Após criação, publica eventos de criação e atualização da lista de ocorrências.
     *
     * @param usersId Identificador do utilizador que reporta a ocorrência.
     * @param endDate Data de fim da ocorrência.
     * @param importance Nível de importância da ocorrência.
     * @param occurrenceType Tipo da ocorrência em formato JSON.
     * @param occurrenceInfo Informação adicional da ocorrência em formato JSON.
     *
     * @return [Occurrence] criada, ou um erro do tipo [OccurrenceError].
     */
    fun createOccurrence(
        usersId: Int,
        endDate: LocalDate,
        importance: OccurrenceType = OccurrenceType.NORMAL,
        occurrenceType: Int,
        occurrenceInfo: JsonNode,
    ): Either<OccurrenceError, Occurrence> {
        val result =
            trxManager.run {
                if (endDate.isBefore(LocalDate.now())) return@run failure(OccurrenceError.EndDateNotValid)
                repoUsers.findById(usersId) ?: return@run failure(OccurrenceError.UserNotFound)
                repoType.findById(occurrenceType) ?: return@run failure(OccurrenceError.TypeNotFound)
                val occurrence =
                    repoOccurrence.createOccurrence(
                        endDate = endDate,
                        reporterId = usersId,
                        importance = importance,
                        occurrenceType = occurrenceType,
                        occurrenceInfo = occurrenceInfo,
                    )
                val userOccurrences = repoOccurrence.findOccurrenceByReporterId(usersId)
                success(OccurrenceCreatedResult(occurrence, userOccurrences))
            }
        if (result is Failure) return result
        val data = (result as Success).value
        publisher.occurrencePublisher.sendMessageToAll(
            data.occurrence.id,
            data.occurrence,
            ActionKind.OccurrenceCreated,
        )
        publisher.occurrencesPublisher.sendMessageToAll(
            usersId,
            data.userOccurrences,
            ActionKind.OccurrencesChanged,
        )
        return success(data.occurrence)
    }

    /**
     * Obtém uma ocorrência pelo seu identificador.
     *
     * @param id Identificador da ocorrência.
     *
     * @return [Occurrence] correspondente, ou erro do tipo [OccurrenceError].
     */
    fun findById(id: Int): Either<OccurrenceError, Occurrence> {
        return trxManager.run {
            val occurrence =
                repoOccurrence.findById(id)
                    ?: return@run failure(OccurrenceError.OccurrenceNotFound)
            success(occurrence)
        }
    }

    /**
     * Obtém todas as ocorrências com um determinado nível de importância.
     *
     * @param importance Nível de importância a filtrar.
     *
     * @return Lista de [Occurrence] com a importância indicada.
     */
    fun findByImportance(importance: OccurrenceType): List<Occurrence> = trxManager.run { repoOccurrence.findByImportance(importance) }

    /**
     * Obtém todas as ocorrências registadas por um determinado utilizador.
     *
     * @param reporterId Identificador do utilizador.
     *
     * @return Lista de [Occurrence] associadas ao utilizador.
     */
    fun findOccurrenceByReporterId(reporterId: Int): List<Occurrence> =
        trxManager.run {
            repoOccurrence.findOccurrenceByReporterId(
                reporterId,
            )
        }

    /**
     * Obtém todas as ocorrências associadas a um interveniente.
     *
     * @param intervenor Interveniente a pesquisar.
     *
     * @return Lista de [Occurrence] onde o interveniente participa.
     */
    fun findByIntervenor(intervenor: Intervenor): List<Occurrence> = trxManager.run { repoOccurrence.findByIntervenor(intervenor) }

    /**
     * Adiciona um interveniente a uma ocorrência.
     *
     * Valida a existência da ocorrência e do interveniente,
     * bem como se o interveniente já está associado.
     * Publica eventos de atualização após a operação.
     *
     * @param occurrenceId Identificador da ocorrência.
     * @param intervenorId Identificador do interveniente.
     *
     * @return [Occurrence] atualizada, ou erro do tipo [OccurrenceError].
     */
    fun addIntervenor(
        occurrenceId: Int,
        intervenorId: Int,
    ): Either<OccurrenceError, Occurrence> {
        val result =
            trxManager.run {
                val occurrence =
                    repoOccurrence.findById(occurrenceId)
                        ?: return@run failure(OccurrenceError.OccurrenceNotFound)

                val intervenor =
                    repoIntervenor.findById(intervenorId)
                        ?: return@run failure(OccurrenceError.IntervenorNotFound)

                if (intervenorId in occurrence.intervenors) {
                    return@run failure(OccurrenceError.IntervenorAlreadyInOccurrence)
                }

                val updated = repoOccurrence.addIntervenor(occurrence, intervenor)
                val userOccurrences = repoOccurrence.findOccurrenceByReporterId(occurrence.reporterId)
                success(IntervenorAddResult(updated, userOccurrences))
            }
        if (result is Failure) return result
        val data = (result as Success).value
        publisher.occurrencePublisher.sendMessageToAll(
            data.updated.id,
            data.updated,
            ActionKind.IntervenorAdded,
        )
        publisher.occurrencesPublisher.sendMessageToAll(
            data.updated.reporterId,
            data.userOccurrences,
            ActionKind.OccurrencesChanged,
        )
        return success(data.updated)
    }

    /**
     * Remove um interveniente de uma ocorrência.
     *
     * Valida a existência da ocorrência e do interveniente,
     * bem como se o interveniente está associado à ocorrência.
     * Publica eventos de atualização após a operação.
     *
     * @param occurrenceId Identificador da ocorrência.
     * @param intervenorId Identificador do interveniente.
     *
     * @return [Occurrence] atualizada, ou erro do tipo [OccurrenceError].
     */
    fun removeIntervenor(
        occurrenceId: Int,
        intervenorId: Int,
    ): Either<OccurrenceError, Occurrence> {
        val result =
            trxManager.run {
                val occurrence =
                    repoOccurrence.findById(occurrenceId)
                        ?: return@run failure(OccurrenceError.OccurrenceNotFound)

                val intervenor =
                    repoIntervenor.findById(intervenorId)
                        ?: return@run failure(OccurrenceError.IntervenorNotFound)

                if (intervenorId !in occurrence.intervenors) {
                    return@run failure(OccurrenceError.IntervenorNotInOccurrence)
                }

                val updated = repoOccurrence.removeIntervenor(occurrence, intervenor)
                val occurrences = repoOccurrence.findOccurrenceByReporterId(intervenorId)

                success(IntervenorRemoveResult(updated, occurrences))
            }
        if (result is Failure) {
            return result
        }

        val data = (result as Success).value
        publisher.occurrencePublisher.sendMessageToAll(
            data.occurrence.id,
            data.occurrence,
            ActionKind.IntervenorRemoved,
        )
        publisher.occurrencesPublisher.sendMessageToAll(
            data.occurrence.reporterId,
            data.occurrences,
            ActionKind.OccurrencesChanged,
        )
        return success(data.occurrence)
    }

    /**
     * Obtém todas as ocorrências registadas no sistema.
     *
     * @return Lista de todas as [Occurrence], ou erro do tipo [OccurrenceError].
     */
    fun findAll(): Either<OccurrenceError, List<Occurrence>> = trxManager.run { success(repoOccurrence.findAll()) }

    /**
     * Remove uma ocorrência do sistema.
     *
     * Publica eventos de eliminação e atualização da lista de ocorrências.
     *
     * @param id Identificador da ocorrência.
     *
     * @return `true` se a eliminação for bem-sucedida, ou erro do tipo [OccurrenceError].
     */
    fun deleteById(id: Int): Either<OccurrenceError, Boolean> {
        val result =
            trxManager.run {
                val occurrence =
                    repoOccurrence.findById(id)
                        ?: return@run failure(OccurrenceError.OccurrenceNotFound)
                repoOccurrence.deleteById(id)
                val occurrences = repoOccurrence.findOccurrenceByReporterId(occurrence.reporterId)
                success(OccurrenceDeleteResult(occurrence.reporterId, occurrences))
            }
        if (result is Failure) {
            return result
        }

        val data = (result as Success).value
        publisher.occurrencePublisher.sendMessageToAll(
            id,
            Unit,
            ActionKind.OccurrenceDeleted,
        )

        publisher.occurrencesPublisher.sendMessageToAll(
            data.reporterId,
            data.occurrences,
            ActionKind.OccurrencesChanged,
        )
        return success(true)
    }
}
