package pt.ira

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import org.apache.pdfbox.pdmodel.PDDocument
import org.apache.pdfbox.pdmodel.PDPage
import org.apache.pdfbox.pdmodel.PDPageContentStream
import org.apache.pdfbox.pdmodel.common.PDRectangle
import org.apache.pdfbox.pdmodel.font.PDType1Font
import org.apache.pdfbox.pdmodel.font.Standard14Fonts
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject
import org.slf4j.LoggerFactory
import org.springframework.core.io.Resource
import org.springframework.stereotype.Component
import pt.ira.emitters.ActionKind
import pt.ira.interfaces.TransactionManager
import pt.ira.publishers.Publishers
import pt.ira.report.Report
import pt.ira.report.ReportStatus
import pt.ira.storage.StorageService
import java.text.Normalizer
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

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
            val filePath = generateReport(occurrenceId, occurrence.occurrenceType, language)
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

            publisher.reportPublisher.sendMessageToAll(
                report.id,
                report,
                ActionKind.ReportCreated,
            )
            success(report)
        }
    }

    companion object {
        private val logger = LoggerFactory.getLogger(ReportService::class.java)
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
     * @return Devolve o caminho do ficheiro persistido no sistema de ficheiros.
     */
    private fun generateReport(
        occurrenceId: Int,
        occurrenceType: Int,
        language: String,
        filePath: String? = null,
    ): String =
        trxManager.run {
            val type = repoType.findById(occurrenceType) ?: return@run ""
            val sections = type.form["sections"]
            val savedSections = findSavedSections(occurrenceId)
            logger.info("Saved sections found: {}", savedSections)

            PDDocument().use { doc ->
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

                fun drawLine() {
                    content.saveGraphicsState()
                    content.setStrokingColor(4f / 255f, 58f / 255f, 35f / 255f)
                    content.setLineWidth(1f)
                    content.moveTo(margin, y)
                    content.lineTo(page.mediaBox.width - margin, y)
                    content.stroke()
                    content.restoreGraphicsState()
                }

                fun writeLine(
                    text: String,
                    isTitle: Boolean = false,
                ) {
                    if (y < margin) newPage()
                    content.beginText()
                    val font =
                        if (isTitle) {
                            PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD)
                        } else {
                            PDType1Font(Standard14Fonts.FontName.HELVETICA)
                        }
                    content.setFont(
                        font,
                        if (isTitle) 16f else 12f,
                    )
                    content.newLineAtOffset(margin, y)
                    content.showText(text.take(120))
                    content.endText()
                    y -= lineHeight
                }

                fun renderSection(
                    title: String,
                    sectionData: JsonNode,
                    fieldLabelMap: Map<String, String>,
                ) {
                    y -= 12
                    writeLine(makeTitle(title), true)
                    y -= 8
                    val data = sectionData["data"] ?: return
                    data.properties()?.forEach {
                        val normalizedKey =
                            it.key.replace(Regex("_\\d+$"), "_{index}")
                        val label =
                            fieldLabelMap[normalizedKey]
                                ?: fieldLabelMap[it.key]
                                ?: it.key
                        val value = it.value?.takeIf { v -> v.asText() != "null" }?.asText()
                        if (value == null) {
                            val notAvailable =
                                when (language) {
                                    "pt" -> "Não disponibilizado"
                                    "es" -> "No proporcionado"
                                    else -> "Not provided"
                                }
                            writeLine("$label: $notAvailable")
                        } else {
                            writeLine("$label: $value")
                        }
                    }
                    y -= 10
                    drawLine()
                    y -= 15
                }

                fun reportTitle(language: String): String =
                    when (language) {
                        "pt" -> "Relatório da Ocorrência $occurrenceId"
                        "es" -> "Informe de Incidencia $occurrenceId"
                        else -> "Occurrence $occurrenceId Report"
                    }

                fun writeTitle(
                    title: String,
                    dateTime: String,
                ) {
                    val logoImage = loadImage(doc, "/images/logo.png", "logo.png")
                    val logoWidth = 80f
                    val spacing = 8f
                    val logoHeight =
                        if (logoImage != null) {
                            logoWidth * logoImage.height.toFloat() / logoImage.width.toFloat()
                        } else {
                            0f
                        }

                    val logoX = margin
                    val logoY = y - logoHeight

                    if (logoImage != null) {
                        content.saveGraphicsState()
                        content.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight)
                        content.restoreGraphicsState()
                    }

                    val textX = logoX + logoWidth + spacing
                    val textStartY = y - 18f
                    content.beginText()
                    val font = PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD)
                    content.setFont(font, 16f)
                    content.newLineAtOffset(textX, textStartY)
                    content.showText(title.take(120))
                    content.endText()

                    content.saveGraphicsState()
                    content.beginText()
                    content.setNonStrokingColor(211f / 255f, 211f / 255f, 211f / 255f)
                    content.setFont(PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 10f)
                    content.newLineAtOffset(textX, y - 38f)
                    content.showText(dateTime.take(120))
                    content.endText()
                    content.restoreGraphicsState()

                    val headerHeight = maxOf(logoHeight, 40f) + 20f
                    y -= headerHeight
                    drawLine()
                    y -= 15f
                }

                fun generateDateTime(language: String): String {
                    val formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")
                    return when (language) {
                        "pt" -> "Data de geração: ${LocalDateTime.now().format(formatter)}"
                        "es" -> "Fecha de generación: ${LocalDateTime.now().format(formatter)}"
                        else -> "Generation date: ${LocalDateTime.now().format(formatter)}"
                    }
                }

                writeTitle(reportTitle(language), generateDateTime(language))

                sections?.forEach { section ->
                    val titleNode = section["title"]
                    val fieldsNode = section["fields"]
                    val fieldLabelMap =
                        fieldsNode
                            .associate { field ->
                                val key = field["name"].asText()
                                val label = field["label"]?.get(language)?.asText() ?: key
                                key to label
                            }

                    val title = titleNode?.get(language)?.asText()
                    val templateKey = sanitizeSectionName(title)
                    val isIndexed = templateKey.contains("index")
                    if (!isIndexed) {
                        val shouldSkipSection = fieldsNode.any { it["dontPrint"]?.asBoolean() == true }
                        if (shouldSkipSection) return@forEach
                        val savedSection =
                            savedSections.firstOrNull {
                                it["section"]?.asText() == templateKey
                            }
                        if (savedSection != null && title != null) {
                            renderSection(
                                title,
                                savedSection,
                                fieldLabelMap,
                            )
                        }
                    } else {
                        val prefix = templateKey.replace("-index-", "")
                        val matches =
                            savedSections
                                .filter {
                                    it["section"]?.asText()?.startsWith(prefix)
                                        ?: false
                                }
                                .sortedBy {
                                    it["section"].asText()?.substringAfterLast("-")
                                        ?.toIntOrNull()
                                }
                        matches.forEach { saved ->
                            val shouldSkipSection = fieldsNode.any { it["dontPrint"]?.asBoolean() == true }
                            if (shouldSkipSection) return@forEach
                            val index = saved["section"].asText().substringAfterLast("-")
                            val sectionTitle =
                                title?.replace(
                                    "{index}",
                                    index,
                                    ignoreCase = true,
                                )
                            if (sectionTitle != null) {
                                renderSection(
                                    sectionTitle,
                                    saved,
                                    fieldLabelMap,
                                )
                            }
                        }
                    }
                }

                content.close()
                if (filePath == null) {
                        val filename = "report_$occurrenceId.pdf"
                        val filepath = storageService.saveReport(filename, doc)
                        doc.close()
                        logger.info("Saving report to: {}", filepath)
                        filepath
                    } else {
                    storageService.updateReport(filePath, doc)
                    doc.close()
                    logger.info("Updating report to: {}", filePath)
                    filePath
                }
            }
        }

    private fun loadImage(
        doc: PDDocument,
        path: String,
        name: String?,
    ): PDImageXObject? {
        return try {
            val stream = javaClass.getResourceAsStream(path)
            if (stream != null) {
                val bytes = stream.readBytes()
                PDImageXObject.createFromByteArray(doc, bytes, name)
            } else {
                logger.warn("Logo image not found in resources")
                null
            }
        } catch (e: Exception) {
            logger.error("Failed to load logo image", e)
            null
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
                        val file = storageService.loadEvidence(it.filePath)
                        val text = file?.inputStream?.bufferedReader()?.readText()
                        objectMapper.readTree(text)
                    } catch (e: Exception) {
                        logger.warn("Failed to load evidence ${it.filePath} for occurrence $occurrenceId", e)
                        null
                    }
                }
        }

    private fun makeTitle(title: String?): String {
        logger.info("Title: {}", title)
        if (title == null) return ""
        val exceptions =
            listOf(
                "de",
                "da",
                "do",
                "das",
                "dos",
                "e",
            )

        return title.lowercase()
            .split(" ")
            .mapIndexed { index, string ->
                if (index > 0 && string in exceptions) {
                    string
                } else {
                    string.replaceFirstChar { it.titlecase() }
                }
            }.joinToString(" ")
    }

    private val objectMapper: ObjectMapper = ObjectMapper().registerKotlinModule()

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
    fun deleteById(id: Int): Either<ReportError, Boolean> {
        return trxManager.run {
            val report =
                repoReport.findById(id)
                    ?: return@run failure(ReportError.ReportNotFound)

            repoReport.deleteById(report.id)
            storageService.deleteReport(report.filePath)
            publisher.reportPublisher.sendMessageToAll(
                report.id,
                Unit,
                ActionKind.ReportDeleted,
            )
            success(true)
        }
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
    fun updateReport(reportId: Int): Either<ReportError, Report> =
        trxManager.run {
            val report = repoReport.findById(reportId) ?: return@run failure(ReportError.ReportNotFound)
            generateReport(
                occurrenceId = report.occurrenceId,
                occurrenceType = report.type,
                language = report.language,
                filePath = report.filePath,
            )
            publisher.reportPublisher.sendMessageToAll(
                report.id,
                report,
                ActionKind.ReportChanged,
            )
            success(report)
        }

    /**
     * Obtém um relatório e o respetivo ficheiro associado.
     *
     * @param id Identificador da evidência.
     *
     * @return Par contendo [Report] e o recurso do ficheiro associado,
     *         ou erro do tipo [ReportError].
     */
    fun downloadReport(id: Int): Either<ReportError, Pair<Report, Resource>> {
        return trxManager.run {
            val report =
                repoReport.findById(id)
                    ?: return@run failure(ReportError.ReportNotFound)

            logger.info("Relatório encontrado: {}", report)

            val resource =
                storageService.loadReport(report.filePath)
                    ?: return@run failure(ReportError.FileNotFound)

            logger.info("Resource encontrado: {}", resource)

            success(Pair(report, resource))
        }
    }
}
