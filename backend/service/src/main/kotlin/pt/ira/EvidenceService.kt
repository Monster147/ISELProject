package pt.ira

import org.springframework.stereotype.Component
import org.springframework.web.multipart.MultipartFile
import pt.ira.emitters.ActionKind
import pt.ira.evidence.CreatedEvidenceResult
import pt.ira.evidence.DownloadEvidence
import pt.ira.evidence.Evidence
import pt.ira.evidence.EvidenceDeletionResult
import pt.ira.evidence.EvidenceUpdateResult
import pt.ira.interfaces.TransactionManager
import pt.ira.publishers.Publishers
import pt.ira.storage.StorageService

/**
 * Hierarquia de erros específicos do domínio das evidências.
 *
 * Encapsula as situações de erro que podem ocorrer durante operações com evidências,
 * permitindo um tratamento explícito e tipificado dos cenários de falha.
 *
 * @see EvidenceService
 */
sealed class EvidenceError {
    /**
     * Indica que a evidência solicitada não foi encontrada na base de dados.
     */
    data object EvidenceNotFound : EvidenceError()

    /**
     * Indica que a ocorrência associada à evidência não existe.
     */
    data object OccurrenceNotFound : EvidenceError()

    /**
     * Indica que o utilizador que reporta a evidência não existe.
     */
    data object ReporterNotFound : EvidenceError()

    /**
     * Indica que o ficheiro fornecido é inválido ou tem um formato não permitido.
     */
    data object InvalidFile : EvidenceError()

    /**
     * Indica que o ficheiro da evidência não foi encontrado no armazenamento.
     */
    data object FileNotFound : EvidenceError()

    /**
     * Indica que a evidência não conseguiu ser registado na base de dados
     */
    data object UploadFailed : EvidenceError()
}

/**
 * Lista de tipos MIME permitidos para *upload* de evidências.
 *
 * Inclui formatos comuns de imagem, vídeo e documento, garantindo
 * que apenas ficheiros seguros e validados são aceites no sistema.
 */
val allowedExtensions =
    listOf(
        "image/jpg",
        "image/jpeg",
        "image/png",
        "image/heic",
        "application/pdf",
        "video/mp4",
        "application/json",
    )

/**
 * Serviço responsável pela gestão do ciclo de vida das evidências.
 *
 * Responsabilidades principais:
 * - criação, consulta, descarga e eliminação de evidências;
 * - validação de ocorrências e utilizadores associados;
 * - gestão de ficheiros por meio de armazenamento interno;
 * - publicação de eventos relacionados com alterações de evidências.
 *
 * @param trxManager gestor de transações usado para aceder aos repositórios dentro de unidades de trabalho.
 * @param storageService serviço responsável pelo armazenamento físico dos ficheiros.
 * @param publisher conjunto de publicadores de eventos do sistema.
 */
@Component
class EvidenceService(
    private val trxManager: TransactionManager,
    private val storageService: StorageService,
    private val publisher: Publishers,
) {
    /**
     * Cria uma evidência associada a uma ocorrência.
     *
     * Valida a existência do utilizador e da ocorrência, valida o ficheiro,
     * persiste os metadados na base de dados e guarda o ficheiro em armazenamento.
     * Em seguida, publica eventos de criação.
     *
     * @param type Tipo da evidência em formato JSON.
     * @param file Ficheiro associado à evidência.
     * @param location Local onde a evidência foi recolhida.
     * @param description Descrição da evidência.
     * @param reporterId Identificador do utilizador que reporta a evidência.
     * @param occurrenceId Identificador da ocorrência associada.
     *
     * @return [Evidence] criada, ou um erro do tipo [EvidenceError].
     */
    fun createEvidence(
        type: String,
        file: MultipartFile,
        location: String,
        description: String,
        reporterId: Int,
        occurrenceId: Int,
    ): Either<EvidenceError, Evidence> {
        val result =
            trxManager.run {
                repoUsers.findById(reporterId) ?: return@run failure(EvidenceError.ReporterNotFound)
                val occurrence = repoOccurrence.findById(occurrenceId) ?: return@run failure(EvidenceError.OccurrenceNotFound)
                if (file.contentType !in allowedExtensions || file.isEmpty) return@run failure(EvidenceError.InvalidFile)

                val filePath = storageService.save(occurrenceId, file)

                try {
                    val evidence =
                        repoEvidence.createEvidence(
                            filePath = filePath,
                            location = location,
                            description = description,
                            reporterId = reporterId,
                            occurrenceId = occurrenceId,
                            type = type,
                        )
                    val updatedOccurrence = repoOccurrence.addEvidence(occurrence, evidence)
                    val reporterEvidences = repoEvidence.findByReporterId(reporterId)
                    val occurrences = repoOccurrence.findOccurrenceByReporterId(reporterId)
                    success(CreatedEvidenceResult(evidence, reporterEvidences, updatedOccurrence, occurrences))
                } catch (e: Exception) {
                    storageService.deleteEvidence(filePath)
                    failure(EvidenceError.UploadFailed)
                }
            }
        if (result is Failure) {
            return result
        }

        val data = (result as Success).value
        publisher.evidencePublisher.sendMessageToAll(
            reporterId,
            data.reporterEvidences,
            ActionKind.EvidenceChanged,
        )
        publisher.occurrencePublisher.sendMessageToAll(
            occurrenceId,
            data.updatedOccurrence,
            ActionKind.EvidenceChanged,
        )
        publisher.occurrencesPublisher.sendMessageToAll(
            reporterId,
            data.occurrences,
            ActionKind.OccurrencesChanged,
        )
        return success(data.evidence)
    }

    /**
     * Obtém uma evidência e o respetivo ficheiro associado.
     *
     * @param id Identificador da evidência.
     *
     * @return [DownloadEvidence] com a evidência e o ficheiro associado,
     *         ou erro do tipo [EvidenceError].
     */
    fun downloadEvidence(id: Int): Either<EvidenceError, DownloadEvidence> {
        return trxManager.run {
            val evidence =
                repoEvidence.findById(id)
                    ?: return@run failure(EvidenceError.EvidenceNotFound)

            val resource =
                storageService.loadEvidence(evidence.filePath)
                    ?: return@run failure(EvidenceError.FileNotFound)

            success(DownloadEvidence(evidence, resource))
        }
    }

    /**
     * Obtém uma evidência pelo seu identificador.
     *
     * @param id Identificador da evidência.
     *
     * @return [Evidence] correspondente, ou erro do tipo [EvidenceError].
     */
    fun findById(id: Int): Either<EvidenceError, Evidence> {
        return trxManager.run {
            val evidence =
                repoEvidence.findById(id)
                    ?: return@run failure(EvidenceError.EvidenceNotFound)
            success(evidence)
        }
    }

    /**
     * Obtém todas as evidências associadas a uma ocorrência.
     *
     * @param occurrenceId Identificador da ocorrência.
     *
     * @return Lista de [Evidence] associadas à ocorrência.
     */
    fun findByOccurrenceId(occurrenceId: Int): List<Evidence> =
        trxManager.run {
            repoEvidence.findByOccurrenceId(occurrenceId)
        }

    /**
     * Obtém todas as evidências reportadas por um utilizador.
     *
     * @param reporterId Identificador do utilizador.
     *
     * @return Lista de [Evidence] associadas ao utilizador.
     */
    fun findByReporterId(reporterId: Int): List<Evidence> =
        trxManager.run {
            repoEvidence.findByReporterId(reporterId)
        }

    /**
     * Obtém todas as evidências de um determinado tipo.
     *
     * @param type Tipo da evidência em formato JSON.
     *
     * @return Lista de [Evidence] correspondentes ao tipo indicado.
     */
    fun findByType(type: String): List<Evidence> =
        trxManager.run {
            repoEvidence.findByType(type)
        }

    /**
     * Obtém todas as evidências associadas a uma localização.
     *
     * @param location Local a filtrar.
     *
     * @return Lista de [Evidence] associadas à localização indicada.
     */
    fun findByLocation(location: String): List<Evidence> =
        trxManager.run {
            repoEvidence.findByLocation(location)
        }

    /**
     * Obtém todas as evidências registadas no sistema.
     *
     * @return Lista de todas as [Evidence].
     */
    fun findAll(): List<Evidence> =
        trxManager.run {
            repoEvidence.findAll()
        }

    /**
     * Remove uma evidência do sistema.
     *
     * Remove tanto os metadados da base de dados como o ficheiro associado
     * no armazenamento. Publica eventos de eliminação após a operação.
     *
     * @param id Identificador da evidência.
     *
     * @return `true` se a eliminação for bem-sucedida, ou erro do tipo [EvidenceError].
     */
    fun deleteById(id: Int): Either<EvidenceError, Boolean> {
        val result =
            trxManager.run {
                val evidence =
                    repoEvidence.findById(id)
                        ?: return@run failure(EvidenceError.EvidenceNotFound)

                repoEvidence.deleteById(evidence.id)
                storageService.deleteEvidence(evidence.filePath)
                val occurrence =
                    repoOccurrence.findById(evidence.occurrenceId)
                        ?: return@run failure(EvidenceError.OccurrenceNotFound)
                repoOccurrence.removeEvidence(occurrence, evidence)
                val reporterId = evidence.reporterId
                val updatedEvidences = repoEvidence.findByReporterId(evidence.reporterId)
                val updatedOccurrences = repoOccurrence.findOccurrenceByReporterId(evidence.reporterId)

                success(
                    EvidenceDeletionResult(
                        reporterId = reporterId,
                        evidences = updatedEvidences,
                        occurrences = updatedOccurrences,
                    ),
                )
            }

        if (result is Failure) {
            return result
        }

        val data = (result as Success).value

        publisher.evidencePublisher.sendMessageToAll(
            data.reporterId,
            data.evidences,
            ActionKind.EvidenceChanged,
        )

        publisher.occurrencesPublisher.sendMessageToAll(
            data.reporterId,
            data.occurrences,
            ActionKind.OccurrencesChanged,
        )

        return success(true)
    }

    /**
     * Atualiza uma evidência existente com novos dados, reescrevendo o ficheiro JSON.
     *
     * Valida a existência da evidência, atualiza os metadados na base de dados
     * e sobrescreve o ficheiro JSON com os novos dados.
     * Publica eventos de atualização após a operação.
     *
     * @param id Identificador da evidência a atualizar.
     * @param newData Novo ficheiro contendo os dados atualizados.
     *
     * @return [Evidence], ou um erro do tipo [EvidenceError].
     */
    fun updateEvidence(
        id: Int,
        newData: MultipartFile,
    ): Either<EvidenceError, Evidence> {
        val result =
            trxManager.run {
                val evidence = repoEvidence.findById(id) ?: return@run failure(EvidenceError.EvidenceNotFound)
                val occurrence = repoOccurrence.findById(evidence.occurrenceId) ?: return@run failure(EvidenceError.OccurrenceNotFound)

                if (newData.contentType != "application/json") return@run failure(EvidenceError.InvalidFile)

                storageService.updateEvidence(evidence.filePath, newData)
                val reporterEvidences = repoEvidence.findByReporterId(evidence.reporterId)

                success(EvidenceUpdateResult(evidence.reporterId, evidence.occurrenceId, evidence, occurrence, reporterEvidences))
            }

        if (result is Failure) {
            return result
        }

        val data = (result as Success).value

        publisher.evidencePublisher.sendMessageToAll(
            data.reporterId,
            data.reporterEvidences,
            ActionKind.EvidenceChanged,
        )

        publisher.occurrencePublisher.sendMessageToAll(
            data.occurrenceId,
            data.occurrence,
            ActionKind.EvidenceChanged,
        )

        return success(data.evidence)
    }
}
