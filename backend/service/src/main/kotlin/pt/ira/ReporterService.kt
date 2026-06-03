package pt.ira

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import org.apache.pdfbox.pdmodel.PDDocument
import org.apache.pdfbox.pdmodel.PDPage
import org.apache.pdfbox.pdmodel.PDPageContentStream
import org.apache.pdfbox.pdmodel.common.PDRectangle
import org.apache.pdfbox.pdmodel.font.PDType1Font
import org.springframework.stereotype.Component
import pt.ira.emitters.ActionKind
import pt.ira.interfaces.TransactionManager
import pt.ira.publishers.Publishers
import pt.ira.report.Report
import pt.ira.report.ReportStatus
import pt.ira.storage.StorageService
import java.text.Normalizer

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
) {

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
            generateReport(occurrenceId, occurrence.occurrenceType ,language)
            publisher.reportPublisher.sendMessageToAll(
                report.id,
                report,
                ActionKind.ReportCreated,
            )
            success(report)
        }
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
     * @param occurrenceType Identificador do tipo de ocorrência.
     * @param language Linguagem do relatório (ex: "pt", "es", "en").
     *
     * @return Não devolve valor. O PDF é gravado no storage com o nome `report_<occurrenceId>.pdf`.
     */
    private fun generateReport(occurrenceId: Int, occurrenceType: Int, language: String) =
        trxManager.run {
            val type = repoType.findById(occurrenceType) ?: return@run
            val sections = type.form["sections"]

            PDDocument().use{ doc ->
                var page = PDPage(PDRectangle.A4)
                doc.addPage(page)
                var content = PDPageContentStream(doc, page)
                val margin = 50f
                var y = page.mediaBox.height - margin
                val lineHeight = 14f


                fun newPage() {
                    content.beginText()
                    content.endText()
                    content.close()
                    page = PDPage(PDRectangle.A4)
                    doc.addPage(page)
                    content = PDPageContentStream(doc, page)
                    y = page.mediaBox.height - margin
                }

                fun writeLine(text: String, isTitle: Boolean = false) {
                    if (y<margin) newPage()
                    content.beginText()
                    content.setFont(
                        if(isTitle) PDType1Font.HELVETICA_BOLD else PDType1Font.HELVETICA,
                        if(isTitle) 16f else 12f
                    )
                    content.newLineAtOffset(margin, y)
                    content.showText(text.take(120))
                    content.endText()
                    y-=lineHeight
                }

                fun sanatizeSectionName(name: String?): String =
                    Normalizer.normalize(name, Normalizer.Form.NFD)
                        .replace(Regex("[\\u0300-\\u036f]"), "")
                        .replace(Regex("[^a-zA-Z0-9]"), "-")
                        .replace(Regex("-+"), "-")
                        .lowercase()

                sections?.forEach { section ->
                    val titleNode = section["title"]
                    val title = titleNode?.get(language)?.asText()
                    val fieldLabelMap = section["fields"]
                        .associate { field ->
                            val key = field["name"].asText()
                            val label = field["label"]?.get(language)?.asText()
                            key to label
                        }
                    val sectionKey = sanatizeSectionName(title)
                    writeLine(sectionKey)
                    y-=5
                    val savedSection = loadSavedSection(occurrenceId, sectionKey)
                    val data = savedSection?.get("data")
                    data?.fields()?.forEach {
                        val label = fieldLabelMap[it.key] ?: it.key
                        val value = it.value?.takeIf { v -> v.asText() != "null" }?.asText()
                        if (value == null) {
                            val notAvailable = when (language) {
                                "pt" -> "Não disponibilizado"
                                "es" -> "No proporcionado"
                                else -> "Not provided"
                            }
                            writeLine("$label: $notAvailable")
                        } else {
                            writeLine("$label: $value")
                        }
                    }
                    y-=10
                }

                content.close()
                val filename = "report_$occurrenceId.pdf"
                storageService.saveReport(filename, doc)
                doc.close()
            }
        }

    private val objectMapper: ObjectMapper = ObjectMapper().registerKotlinModule()

    private fun loadSavedSection(occurrenceId: Int, sectionKey: String) : JsonNode? {
        val path = "occurrences/$occurrenceId/evidences/section-$sectionKey.json"
        val resource = storageService.loadEvidence(path) ?: return null
        return try {
            resource.inputStream.use {
                objectMapper.readTree(it)
            }
        }catch (e: Exception) {
            null
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
            repoReport.updateStatus(report, ReportStatus.SUBMITTED)
            success(true)
        }

    }

    /**
     * Obtém todos os relatórios com um determinado estado.
     *
     * @param status Estado do relatório.
     *
     * @return Lista de [Report] com o estado indicado.
     */
    fun findByStatus(status: ReportStatus): List<Report> =
        trxManager.run { repoReport.findByStatus(status) }

    /**
     * Obtém todos os relatórios criados por um determinado utilizador.
     *
     * @param creatorId Identificador do utilizador.
     *
     * @return Lista de [Report] associadas ao utilizador.
     */
    fun findByCreatorId(creatorId: Int): List<Report> =
        trxManager.run { repoReport.findByCreatorId(creatorId) }

    /**
     * Obtém todos os relatórios em que um utilizador é editor.
     *
     * @param userId Identificador do utilizador.
     *
     * @return Lista de [Report] onde o utilizador é editor.
     */
    fun findByEditor(userId: Int): List<Report> =
        trxManager.run { repoReport.findByEditor(userId) }

    /**
     * Obtém todos os relatórios de um determinado tipo.
     *
     * @param type Tipo do relatório em formato JSON.
     *
     * @return Lista de [Report] correspondentes ao tipo indicado.
     */
    fun findByType(type: Int): List<Report> =
        trxManager.run { repoReport.findByType(type) }

    /**
     * Obtém todos os relatórios registados no sistema.
     *
     * @return Lista de todas as [Report].
     */
    fun findAll(): List<Report> =
        trxManager.run { repoReport.findAll() }

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
