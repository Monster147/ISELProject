package pt.ira

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import org.apache.pdfbox.pdmodel.PDDocument
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import pt.ira.emitters.ActionKind
import pt.ira.interfaces.TransactionManager
import pt.ira.publishers.Publishers
import pt.ira.report.DownloadReport
import pt.ira.report.Report
import pt.ira.report.ReportStatus
import pt.ira.storage.StorageService
import pt.ira.type.Type
import java.text.Normalizer
import kotlin.collections.any
import kotlin.collections.associate
import kotlin.collections.forEach

/**
 * Hierarquia de erros específicos do domínio dos relatórios.
 *
 * Encapsula as situações de erro que podem ocorrer durante operações com relatórios,
 * permitindo um tratamento explícito e tipificado dos cenários de falha.
 *
 * @see ReportService
 */
sealed class ReportError {
    /**
     * O relatório solicitado não foi encontrado no sistema.
     */
    data object ReportNotFound : ReportError()

    /**
     * O utilizador especificado não existe no sistema.
     */
    data object UserNotFound : ReportError()

    /**
     * O interveniente especificado não existe no sistema.
     */
    data object IntervenorNotFound : ReportError()

    /**
     * A ocorrência especificada não existe no sistema.
     */
    data object OccurrenceNotFound : ReportError()

    /**
     * A ocorrência não foi atribuída ao utilizador solicitante
     */
    data object OccurrenceNotAssignedToUser : ReportError()

    /**
     * Já existe um relatório associado à ocorrência especificada.
     */
    data object OccurrenceAlreadyHasReport : ReportError()

    /**
     * Já existe um relatório submetido ou aprovado.
     */
    data object ReportAlreadySubmittedOrApproved : ReportError()

    /**
     * O tipo solicitado não foi encontrado no sistema,
     * quer por identificador, quer por nome.
     */
    data object TypeNotFound : ReportError()

    /**
     * O relatório não preenche todos os campos obrigatórios definidos no formulário do tipo de ocorrência.
     */
    data object MissingRequiredFields : ReportError()

    /**
     * Indica que o ficheiro da evidência não foi encontrado no armazenamento.
     */
    data object FileNotFound : ReportError()

    /**
     * Indica que o relatório não conseguiu ser registado na base de dados
     */
    data object UploadFailed : ReportError()
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
    private val storageService: StorageService,
    private val pdfGenerator: PDFGenerator,
) {
    companion object {
        private val objectMapper: ObjectMapper = ObjectMapper().registerKotlinModule()
        private val logger = LoggerFactory.getLogger(ReportService::class.java)
    }

    /**
     * Cria um relatório associado a uma ocorrência.
     *
     * Valida a existência do utilizador e da ocorrência, verifica se já existe
     * um relatório associado e se o utilizador é o responsável pela ocorrência.
     * Após criação, ele cria um ficheiro PDF com os dados do relatório e
     * publica evento de criação.
     *
     * @param creatorId Identificador do utilizador que cria o relatório.
     * @param occurrenceId Identificador da ocorrência associada.
     * @param title Título do relatório.
     * @param description Descrição do relatório.
     * @param addons Informação adicional em formato JSON.
     * @param language Linguagem do relatório.
     *
     * @return [Report] criado, ou um erro do tipo [ReportError].
     */
    fun createReport(
        creatorId: Int,
        occurrenceId: Int,
        title: String,
        description: String,
        addons: JsonNode,
        language: String,
    ): Either<ReportError, Report> {
        val result =
            trxManager.run {
                repoUsers.findById(creatorId) ?: return@run failure(ReportError.UserNotFound)
                val occurrence = repoOccurrence.findById(occurrenceId) ?: return@run failure(ReportError.OccurrenceNotFound)
                val existingReport = repoReport.findByOccurrenceId(occurrenceId)
                if (existingReport != null) {
                    return@run failure(ReportError.OccurrenceAlreadyHasReport)
                }
                if (occurrence.reporterId != creatorId) {
                    return@run failure(ReportError.OccurrenceNotAssignedToUser)
                }
                val type = repoType.findById(occurrence.occurrenceType) ?: return@run failure(ReportError.TypeNotFound)
                val filePath = generateReport(occurrenceId, type, language)
                try {
                    val report =
                        repoReport.createReport(
                            creatorId = creatorId,
                            occurrenceId = occurrenceId,
                            title = title,
                            description = description,
                            type = occurrence.occurrenceType,
                            addons = addons,
                            intervenors = occurrence.intervenors,
                            language = language,
                            filePath = filePath,
                        )
                    success(report)
                } catch (e: Exception) {
                    storageService.deleteReport(filePath)
                    failure(ReportError.UploadFailed)
                }
            }
        if (result is Failure) return result
        val data = (result as Success).value
        publisher.reportPublisher.sendMessageToAll(
            data.id,
            data,
            ActionKind.ReportCreated,
        )
        return success(data)
    }

    /**
     * Gera um relatório em PDF com base na definição de formulário associada ao tipo de ocorrência
     * e nos dados de evidência previamente armazenados.
     *
     * O processo de geração segue os seguintes passos:
     * 1. Obtém o tipo de ocorrência a partir do identificador fornecido.
     * 2. Extrai a estrutura do formulário (secções e campos) definida no tipo.
     * 3. Para cada secção, tenta carregar os dados persistidos no storage.
     * 4. Constrói dinamicamente um documento PDF com os valores encontrados.
     * 5. Caso um campo não tenha valor associado, é apresentado um texto de fallback
     *    dependente da linguagem.
     * 6. O ficheiro final é persistido através do serviço de storage.
     *
     * @param occurrenceId Identificador da ocorrência.
     * @param occurrenceType Tipo de ocorrência.
     * @param language Linguagem do relatório (ex: "pt", "es", "en").
     *
     * @return Devolve o caminho do ficheiro persistido no sistema de ficheiros.
     */
    private fun generateReport(
        occurrenceId: Int,
        occurrenceType: Type,
        language: String,
        filePath: String? = null,
    ): String {
        val sections = occurrenceType.form["sections"]
        val savedSections = findSavedSections(occurrenceId)
        logger.info("Saved sections found: {}", savedSections)

        PDDocument().use { doc ->
            val pdfBuilder =
                pdfGenerator.createPDFBuilder(
                    doc,
                    language,
                )

            pdfBuilder.writeTitle(occurrenceId)

            sections?.forEach { section ->
                val titleNode = section["title"]
                val sectionTitle = titleNode?.get(language)?.asText() ?: return@forEach
                val fieldsNode = section["fields"]
                val fieldLabelMap =
                    fieldsNode.associate { field ->
                        val key = field["name"].asText()
                        val label = field["label"]?.get(language)?.asText() ?: key
                        key to label
                    }

                val shouldSkipSection = fieldsNode.any { it["dontPrint"]?.asBoolean() == true }
                if (shouldSkipSection) return@forEach

                val templateKey = sanitizeSectionName(sectionTitle)
                val isIndexed = templateKey.contains("index")
                if (!isIndexed) {
                    val savedSection =
                        savedSections.firstOrNull {
                            it["section"]?.asText() == templateKey
                        }
                    savedSection?.let { pdfBuilder.renderSection(sectionTitle, it, fieldLabelMap) }
                } else {
                    val prefix = templateKey.replace("-index-", "")
                    savedSections.filter { it["section"]?.asText()?.startsWith(prefix) ?: false }
                        .sortedBy { it["section"].asText()?.substringAfterLast("-")?.toIntOrNull() }
                        .forEach { saved ->
                            val index = saved["section"].asText().substringAfterLast("-")
                            pdfBuilder.renderSection(
                                sectionTitle.replace(
                                    "{index}",
                                    index,
                                    ignoreCase = true,
                                ),
                                saved,
                                fieldLabelMap,
                            )
                        }
                }
            }

            pdfBuilder.close()
            if (filePath == null) {
                val filename = "report_$occurrenceId.pdf"
                val filepath = storageService.saveReport(filename, doc)
                doc.close()
                logger.info("Saving report to: {}", filepath)
                return filepath
            } else {
                storageService.updateReport(filePath, doc)
                doc.close()
                logger.info("Updating report to: {}", filePath)
                return filePath
            }
        }
    }

    private fun findSavedSections(occurrenceId: Int): List<JsonNode> =
        trxManager.run {
            val evidenceList = repoEvidence.findByOccurrenceId(occurrenceId)
            if (evidenceList.isEmpty()) return@run listOf()
            evidenceList
                .filter {
                    it.filePath.endsWith(".json") && it.filePath.contains("section-")
                }
                .mapNotNull {
                    try {
                        storageService.loadEvidence(it.filePath)
                            ?.inputStream
                            ?.bufferedReader()
                            ?.use { reader ->
                                objectMapper.readTree(reader.readText())
                            }
                    } catch (e: Exception) {
                        logger.warn("Failed to load evidence ${it.filePath} for occurrence $occurrenceId", e)
                        null
                    }
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
     * Obtém um relatório pelo identificador da ocorrência.
     *
     * @param occurrenceId Identificador da ocorrência.
     *
     * @return [Report] correspondente, ou erro do tipo [ReportError].
     */
    fun findByOccurrenceId(occurrenceId: Int): Either<ReportError, Report> {
        return trxManager.run {
            val report = repoReport.findByOccurrenceId(occurrenceId) ?: return@run failure(ReportError.ReportNotFound)
            success(report)
        }
    }

    /**
     * Atualiza o status do relatório para "SUBMITTED", indicando que foi submetido para revisão.
     *
     * @param id Identificador do relatório a submeter.
     *
     * @return [Boolean] indicando sucesso da operação, ou erro do tipo [ReportError] caso o relatório não exista ou já esteja submetido/aprovado.
     */
    fun submitReport(id: Int): Either<ReportError, Boolean> {
        return trxManager.run {
            val report =
                repoReport.findById(id)
                    ?: return@run failure(ReportError.ReportNotFound)
            if (report.status == ReportStatus.SUBMITTED || report.status == ReportStatus.APPROVED) {
                return@run failure(ReportError.ReportAlreadySubmittedOrApproved)
            }
            val type =
                repoType.findById(report.type)
                    ?: return@run failure(ReportError.TypeNotFound)

            if (!areAllRequiredFieldsFilled(type.form, report.occurrenceId, report.language)) {
                return@run failure(ReportError.MissingRequiredFields)
            }

            repoReport.updateStatus(report, ReportStatus.SUBMITTED)
            success(true)
        }
    }

    private fun areAllRequiredFieldsFilled(
        formJson: JsonNode,
        occurrenceId: Int,
        language: String,
    ): Boolean {
        val sections = formJson["sections"]

        for (section in sections) {
            val repeatFor = section["repeatFor"]?.asText()

            if (repeatFor != null) {
                val repeatCount = findFieldValue(formJson, occurrenceId, repeatFor, language)?.asInt() ?: 0
                if (repeatCount == 0) {
                    continue
                }
                for (i in 0 until repeatCount) {
                    val sectionTitle = section["title"]
                    val expandedTitle = sectionTitle?.get(language)?.asText()?.replace("{index}", i.toString())
                    val sanitizedTitle = sanitizeSectionName(expandedTitle)
                    val savedSection = loadSavedSection(occurrenceId, sanitizedTitle)
                    val data = savedSection?.get("data")
                    for (field in section["fields"]) {
                        if (!field["required"].asBoolean()) {
                            continue
                        }
                        val fieldName = field["name"].asText().replace("{index}", i.toString())
                        val value = data?.get(fieldName)
                        if (value == null || value.asText().isBlank()) {
                            return false
                        }
                    }
                }
            } else {
                val sectionTitle = section["title"]
                val sanitizedTitle = sanitizeSectionName(sectionTitle?.get(language)?.asText())
                val savedSection = loadSavedSection(occurrenceId, sanitizedTitle)
                val data = savedSection?.get("data")
                for (field in section["fields"]) {
                    if (!field["required"].asBoolean()) {
                        continue
                    }
                    val fieldName = field["name"].asText()
                    val value = data?.get(fieldName)
                    if (value == null || value.asText().isBlank()) {
                        return false
                    }
                }
            }
        }
        return true
    }

    private fun loadSavedSection(
        occurrenceId: Int,
        sectionKey: String,
    ): JsonNode? {
        val path = "occurrences/$occurrenceId/evidences/section-$sectionKey.json"
        val resource = storageService.loadEvidence(path) ?: return null
        return try {
            resource.inputStream.use {
                objectMapper.readTree(it)
            }
        } catch (e: Exception) {
            null
        }
    }

    private fun findFieldValue(
        formJson: JsonNode,
        occurrenceId: Int,
        fieldName: String,
        language: String,
    ): JsonNode? {
        val sections = formJson["sections"]
        for (section in sections) {
            val sectionTitle = section["title"]
            val sanitizedTitle = sanitizeSectionName(sectionTitle?.get(language)?.asText())
            val savedSection = loadSavedSection(occurrenceId, sanitizedTitle)
            val data = savedSection?.get("data")
            val value = data?.get(fieldName)
            if (value != null) {
                return value
            }
        }
        return null
    }

    private fun sanitizeSectionName(name: String?): String =
        Normalizer.normalize(name, Normalizer.Form.NFD)
            .replace(Regex("[\\u0300-\\u036f]"), "")
            .replace(Regex("[^a-zA-Z0-9]"), "-")
            .replace(Regex("-+"), "-")
            .lowercase()

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
    fun findByType(type: Int): List<Report> = trxManager.run { repoReport.findByType(type) }

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
        val result =
            trxManager.run {
                val report =
                    repoReport.findById(reportId)
                        ?: return@run failure(ReportError.ReportNotFound)

                val user =
                    repoUsers.findById(userId)
                        ?: return@run failure(ReportError.UserNotFound)

                val updated = repoReport.addEditor(report, user)
                success(updated)
            }
        if (result is Failure) {
            return result
        }

        val data = (result as Success).value
        publisher.reportPublisher.sendMessageToAll(
            data.id,
            data,
            ActionKind.EditorAdded,
        )
        return success(data)
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
        val result =
            trxManager.run {
                val report =
                    repoReport.findById(reportId)
                        ?: return@run failure(ReportError.ReportNotFound)

                val user =
                    repoUsers.findById(userId)
                        ?: return@run failure(ReportError.UserNotFound)

                val updated = repoReport.removeEditor(report, user)
                success(updated)
            }
        if (result is Failure) {
            return result
        }

        val data = (result as Success).value
        publisher.reportPublisher.sendMessageToAll(
            data.id,
            data,
            ActionKind.EditorRemoved,
        )
        return success(data)
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
        val result =
            trxManager.run {
                val report =
                    repoReport.findById(reportId)
                        ?: return@run failure(ReportError.ReportNotFound)

                val updated = repoReport.updateStatus(report, status)
                success(updated)
            }
        if (result is Failure) {
            return result
        }

        val data = (result as Success).value
        publisher.reportPublisher.sendMessageToAll(
            data.id,
            data,
            ActionKind.ReportStatusChanged,
        )
        return success(data)
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
    fun deleteById(id: Int): Either<ReportError, Boolean> {
        val result =
            trxManager.run {
                val report =
                    repoReport.findById(id)
                        ?: return@run failure(ReportError.ReportNotFound)

                repoReport.deleteById(report.id)
                storageService.deleteReport(report.filePath)
                success(report)
            }
        if (result is Failure) {
            return result
        }

        val data = (result as Success).value

        publisher.reportPublisher.sendMessageToAll(
            data.id,
            Unit,
            ActionKind.ReportDeleted,
        )
        return success(true)
    }

    /**
     * Atualiza um relatório existente com novos dados, reescrevendo o ficheiro PDF.
     *
     * Valida a existência do relatório e sobrescreve o ficheiro PDF com os novos dados.
     * Publica eventos de atualização após a operação.
     *
     * @param reportId Identificador da evidência a atualizar.
     *
     * @return [Report], ou um erro do tipo [ReportError].
     */
    fun updateReport(reportId: Int): Either<ReportError, Report> {
        val result =
            trxManager.run {
                val report = repoReport.findById(reportId) ?: return@run failure(ReportError.ReportNotFound)
                val type = repoType.findById(report.type) ?: return@run failure(ReportError.TypeNotFound)
                generateReport(
                    occurrenceId = report.occurrenceId,
                    occurrenceType = type,
                    language = report.language,
                    filePath = report.filePath,
                )
                success(report)
            }
        if (result is Failure) {
            return result
        }

        val data = (result as Success).value
        publisher.reportPublisher.sendMessageToAll(
            data.id,
            data,
            ActionKind.ReportChanged,
        )
        return success(data)
    }

    /**
     * Obtém um relatório e o respetivo ficheiro associado.
     *
     * @param id Identificador da evidência.
     *
     * @return Par contendo [Report] e o recurso do ficheiro associado,
     *         ou erro do tipo [ReportError].
     */
    fun downloadReport(id: Int): Either<ReportError, DownloadReport> {
        return trxManager.run {
            val report =
                repoReport.findById(id)
                    ?: return@run failure(ReportError.ReportNotFound)

            logger.info("Relatório encontrado: {}", report)

            val resource =
                storageService.loadReport(report.filePath)
                    ?: return@run failure(ReportError.FileNotFound)

            logger.info("Resource encontrado: {}", resource)

            success(DownloadReport(report, resource))
        }
    }
}
