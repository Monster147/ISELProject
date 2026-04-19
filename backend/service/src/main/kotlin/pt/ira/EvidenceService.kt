package pt.ira

import com.fasterxml.jackson.databind.JsonNode
import org.springframework.core.io.Resource
import org.springframework.stereotype.Component
import org.springframework.web.multipart.MultipartFile
import pt.ira.emitters.ActionKind
import pt.ira.evindence.Evidence
import pt.ira.interfaces.TransactionManager
import pt.ira.publishers.Publishers
import pt.ira.storage.StorageService

sealed class EvidenceError {
    data object EvidenceNotFound : EvidenceError()

    data object OccurrenceNotFound : EvidenceError()

    data object ReporterNotFound : EvidenceError()

    data object InvalidFile : EvidenceError()

    data object FileNotFound : EvidenceError()
}

/**
 * Serviço responsável pela gestão do ciclo de vida das evidências.
 *
 * Responsabilidades principais:
 * - criação, consulta, descarga e eliminação de evidências;
 * - validação de ocorrências e utilizadores associados;
 * - gestão de ficheiros através de armazenamento interno;
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
    private val allowedExtensions =
        listOf(
            "image/jpg",
            "image/jpeg",
            "image/png",
            "image/heic",
            "application/pdf",
            "video/mp4",
        )

    /**
     * Cria uma nova evidência associada a uma ocorrência.
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
        type: JsonNode,
        file: MultipartFile,
        location: String,
        description: String,
        reporterId: Int,
        occurrenceId: Int,
    ): Either<EvidenceError, Evidence> {
        return trxManager.run {
            repoUsers.findById(reporterId) ?: return@run failure(EvidenceError.ReporterNotFound)
            repoOccurrence.findById(occurrenceId) ?: return@run failure(EvidenceError.OccurrenceNotFound)
            if (file.isEmpty) return@run failure(EvidenceError.InvalidFile)
            if (file.contentType !in allowedExtensions) return@run failure(EvidenceError.InvalidFile)

            val filePath = storageService.save(occurrenceId, file)

            val evidence =
                repoEvidence.createEvidence(
                    filePath = filePath,
                    location = location,
                    description = description,
                    reporterId = reporterId,
                    occurrenceId = occurrenceId,
                    type = type,
                )
            publisher.evidencePublisher.sendMessageToAll(
                evidence.id,
                evidence,
                ActionKind.EvidenceCreated,
            )
            publisher.occurrencePublisher.sendMessageToAll(
                occurrenceId,
                evidence,
                ActionKind.EvidenceCreated,
            )
            val occurrences = repoOccurrence.findOccurrenceByReporterId(reporterId)
            publisher.occurrencesPublisher.sendMessageToAll(
                reporterId,
                occurrences,
                ActionKind.OccurrencesChanged,
            )
            success(evidence)
        }
    }

    /**
     * Obtém uma evidência e o respetivo ficheiro associado.
     *
     * @param id Identificador da evidência.
     *
     * @return Par contendo [Evidence] e o recurso do ficheiro associado,
     *         ou erro do tipo [EvidenceError].
     */
    fun downloadEvidence(id: Int): Either<EvidenceError, Pair<Evidence, Resource>> {
        return trxManager.run {
            val evidence =
                repoEvidence.findById(id)
                    ?: return@run failure(EvidenceError.EvidenceNotFound)

            val resource =
                storageService.loadEvidence(evidence.filePath)
                    ?: return@run failure(EvidenceError.FileNotFound)

            success(Pair(evidence, resource))
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
    fun findByOccurrenceId(occurrenceId: Int): List<Evidence> {
        return trxManager.run {
            repoEvidence.findByOccurrenceId(occurrenceId)
        }
    }

    /**
     * Obtém todas as evidências reportadas por um utilizador.
     *
     * @param reporterId Identificador do utilizador.
     *
     * @return Lista de [Evidence] associadas ao utilizador.
     */
    fun findByReporterId(reporterId: Int): List<Evidence> {
        return trxManager.run {
            repoEvidence.findByReporterId(reporterId)
        }
    }

    /**
     * Obtém todas as evidências de um determinado tipo.
     *
     * @param type Tipo da evidência em formato JSON.
     *
     * @return Lista de [Evidence] correspondentes ao tipo indicado.
     */
    fun findByType(type: JsonNode): List<Evidence> {
        return trxManager.run {
            repoEvidence.findByType(type)
        }
    }

    /**
     * Obtém todas as evidências associadas a uma localização.
     *
     * @param location Local a filtrar.
     *
     * @return Lista de [Evidence] associadas à localização indicada.
     */
    fun findByLocation(location: String): List<Evidence> {
        return trxManager.run {
            repoEvidence.findByLocation(location)
        }
    }

    /**
     * Obtém todas as evidências registadas no sistema.
     *
     * @return Lista de todas as [Evidence].
     */
    fun findAll(): List<Evidence> {
        return trxManager.run {
            repoEvidence.findAll()
        }
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
        return trxManager.run {
            val evidence =
                repoEvidence.findById(id)
                    ?: return@run failure(EvidenceError.EvidenceNotFound)

            repoEvidence.deleteById(evidence.id)
            storageService.deleteEvidence(evidence.filePath)
            publisher.evidencePublisher.sendMessageToAll(
                evidence.occurrenceId,
                Unit,
                ActionKind.EvidenceDeleted,
            )
            publisher.occurrencePublisher.sendMessageToAll(
                evidence.occurrenceId,
                Unit,
                ActionKind.EvidenceDeleted,
            )
            val occurrences = repoOccurrence.findOccurrenceByReporterId(evidence.reporterId)
            publisher.occurrencesPublisher.sendMessageToAll(
                evidence.reporterId,
                occurrences,
                ActionKind.OccurrencesChanged,
            )
            success(true)
        }
    }
}
