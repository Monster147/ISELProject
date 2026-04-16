package pt.ira

import com.fasterxml.jackson.databind.JsonNode
import org.springframework.stereotype.Component
import pt.ira.emitters.ActionKind
import pt.ira.interfaces.TransactionManager
import pt.ira.publishers.Publishers
import pt.ira.report.Report
import pt.ira.report.ReportStatus

sealed class ReportError {
    data object ReportNotFound : ReportError()

    data object UserNotFound : ReportError()

    data object IntervenorNotFound : ReportError()

    data object OccurrenceNotFound : ReportError()

    data object OccurrenceNotAssignedToUser : ReportError()

    data object OccurrenceAlreadyHasReport : ReportError()
}

/**
 * Serviço responsável pela gestão do ciclo de vida dos relatórios.
 *
 * Responsabilidades principais:
 * - criação, consulta e eliminação de relatórios;
 * - validação de utilizadores e ocorrências associadas;
 * - gestão de editores e estado dos relatórios;
 * - publicação de eventos relacionados com alterações de relatórios.
 *
 * @param trxManager gestor de transações usado para aceder aos repositórios dentro de unidades de trabalho.
 * @param publisher conjunto de publicadores de eventos do sistema.
 */
@Component
class ReportService(
    private val trxManager: TransactionManager,
    private val publisher: Publishers,
) {
    /**
     * Cria um relatório associado a uma ocorrência.
     *
     * Valida a existência do utilizador e da ocorrência, verifica se já existe
     * um relatório associado e se o utilizador é o responsável pela ocorrência.
     * Após criação, publica evento de criação.
     *
     * @param creatorId Identificador do utilizador que cria o relatório.
     * @param occurrenceId Identificador da ocorrência associada.
     * @param title Título do relatório.
     * @param description Descrição do relatório.
     * @param addons Informação adicional em formato JSON.
     *
     * @return [Report] criado, ou um erro do tipo [ReportError].
     */
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
                ActionKind.ReportCreated,
            )
            success(report)
        }
    }

    /**
     * Obtém um relatório pelo seu identificador.
     *
     * @param id Identificador do relatório.
     *
     * @return [Report] correspondente, ou erro do tipo [ReportError].
     */
    fun findById(id: Int): Either<ReportError, Report> {
        return trxManager.run {
            val report =
                repoReport.findById(id)
                    ?: return@run failure(ReportError.ReportNotFound)
            success(report)
        }
    }

    /**
     * Obtém todos os relatórios com um determinado estado.
     *
     * @param status Estado do relatório.
     *
     * @return Lista de [Report] com o estado indicado.
     */
    fun findByStatus(status: ReportStatus): List<Report> = trxManager.run { repoReport.findByStatus(status) }

    /**
     * Obtém todos os relatórios criados por um determinado utilizador.
     *
     * @param creatorId Identificador do utilizador.
     *
     * @return Lista de [Report] associadas ao utilizador.
     */
    fun findByCreatorId(creatorId: Int): List<Report> = trxManager.run { repoReport.findByCreatorId(creatorId) }

    /**
     * Obtém todos os relatórios em que um utilizador é editor.
     *
     * @param userId Identificador do utilizador.
     *
     * @return Lista de [Report] onde o utilizador é editor.
     */
    fun findByEditor(userId: Int): List<Report> = trxManager.run { repoReport.findByEditor(userId) }

    /**
     * Obtém todos os relatórios de um determinado tipo.
     *
     * @param type Tipo do relatório em formato JSON.
     *
     * @return Lista de [Report] correspondentes ao tipo indicado.
     */
    fun findByType(type: JsonNode): List<Report> = trxManager.run { repoReport.findByType(type) }

    /**
     * Obtém todos os relatórios registados no sistema.
     *
     * @return Lista de todas as [Report].
     */
    fun findAll(): List<Report> = trxManager.run { repoReport.findAll() }

    /**
     * Adiciona um editor a um relatório.
     *
     * Valida a existência do relatório e do utilizador.
     * Publica evento de atualização após a operação.
     *
     * @param reportId Identificador do relatório.
     * @param userId Identificador do utilizador a adicionar como editor.
     *
     * @return [Report] atualizado, ou erro do tipo [ReportError].
     */
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
                ActionKind.EditorAdded,
            )
            success(updated)
        }
    }

    /**
     * Remove um editor de um relatório.
     *
     * Valida a existência do relatório e do utilizador.
     * Publica evento de atualização após a operação.
     *
     * @param reportId Identificador do relatório.
     * @param userId Identificador do utilizador a remover.
     *
     * @return [Report] atualizado, ou erro do tipo [ReportError].
     */
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
                ActionKind.EditorRemoved,
            )
            success(updated)
        }
    }

    /**
     * Atualiza o estado de um relatório.
     *
     * Valida a existência do relatório.
     * Publica evento de alteração de estado.
     *
     * @param reportId Identificador do relatório.
     * @param status Novo estado do relatório.
     *
     * @return [Report] atualizado, ou erro do tipo [ReportError].
     */
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
                ActionKind.ReportStatusChanged,
            )
            success(updated)
        }
    }

    /**
     * Remove um relatório do sistema.
     *
     * Publica evento de eliminação após a operação.
     *
     * @param id Identificador do relatório.
     *
     * @return `true` se a eliminação for bem-sucedida, ou erro do tipo [ReportError].
     */
    fun deleteById(id: Int): Either<ReportError, Boolean> { // Boolean or Unit
        return trxManager.run {
            val report =
                repoReport.findById(id)
                    ?: return@run failure(ReportError.ReportNotFound)

            repoReport.deleteById(report.id)
            publisher.reportPublisher.sendMessageToAll(
                report.id,
                Unit,
                ActionKind.ReportDeleted,
            )
            success(true)
        }
    }
}
