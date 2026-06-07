package pt.ira

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter
import pt.ira.model.Problem
import pt.ira.model.report.CreateReportInput
import pt.ira.model.report.EditorInput
import pt.ira.model.report.StatusInput
import pt.ira.publishers.Publishers
import pt.ira.report.Report
import pt.ira.report.ReportStatus

/**
 * Controlador REST responsável pela gestão de relatórios no sistema.
 *
 * Expõe endpoints HTTP para criação, consulta, atualização e eliminação de relatórios,
 * bem como operações de gestão de estado e de colaboradores (editores), além de suporte
 * a notificações em tempo real através de Server-Sent Events (SSE).
 *
 * Este controlador atua como camada de adaptação entre o protocolo HTTP e a lógica de domínio,
 * delegando toda a execução ao [ReportService] e traduzindo os resultados para respostas HTTP
 * com mapeamento explícito de erros de domínio.
 *
 * Responsabilidades principais:
 * - criação e eliminação de relatórios;
 * - consulta por identificador, estado e criador;
 * - atualização do estado de um relatório;
 * - gestão de editores associados a um relatório;
 * - exposição de stream SSE para atualizações em tempo real de um relatório;
 * - conversão de erros de domínio em respostas HTTP consistentes.
 *
 * @param reportService serviço responsável pela lógica de negócio dos relatórios.
 * @param publisher conjunto de publicadores responsáveis por eventos e notificações SSE.
 */
@RestController
@RequestMapping("/api/report")
class ReportController(
    private val reportService: ReportService,
    private val publisher: Publishers,
) {
    /**
     * Cria um relatório no sistema.
     *
     * Em caso de sucesso, devolve `201 Created` com o header `Location`
     * a apontar para o recurso criado.
     *
     * @param reportInput dados necessários para criação do relatório.
     *
     * @return resposta HTTP com o resultado da operação.
     */
    @PostMapping
    fun createReport(
        @RequestBody reportInput: CreateReportInput,
    ): ResponseEntity<*> {
        val result =
            reportService.createReport(
                creatorId = reportInput.creatorId,
                occurrenceId = reportInput.occurrenceId,
                title = reportInput.title,
                description = reportInput.description,
                addons = reportInput.addons,
                language = reportInput.language,
            )
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.CREATED)
                    .header("Location", "/api/report/${result.value.id}")
                    .build<Unit>()
            is Failure ->
                when (result.value) {
                    ReportError.UserNotFound -> Problem.UserNotFound.response(HttpStatus.NOT_FOUND)
                    ReportError.OccurrenceNotFound -> Problem.OccurrenceNotFound.response(HttpStatus.NOT_FOUND)
                    ReportError.OccurrenceNotAssignedToUser -> Problem.OccurrenceNotAssignedToUser.response(HttpStatus.FORBIDDEN)
                    ReportError.OccurrenceAlreadyHasReport -> Problem.OccurrenceAlreadyHasReport.response(HttpStatus.CONFLICT)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    /**
     * Obtém um relatório pelo seu identificador.
     *
     * @param id identificador do relatório.
     *
     * @return `200 OK` com o relatório ou `404 Not Found` caso não exista.
     */
    @GetMapping("/{id}")
    fun findReportById(
        @PathVariable id: Int,
    ): ResponseEntity<*> {
        val result = reportService.findById(id)
        return when (result) {
            is Success -> ResponseEntity.status(HttpStatus.OK).body(result.value)
            is Failure ->
                when (result.value) {
                    ReportError.ReportNotFound -> Problem.ReportNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    /**
     *  Atualiza o status do relatório para "SUBMITTED", indicando que foi submetido para revisão.
     *
     *  @param id Identificador do relatório a submeter.
     *
     *  @return `200 OK`, `404 Not Found` caso não exista ou `409 Conflict` se o relatório já estiver submetido ou aprovado.
     */
    @PostMapping("/submit/{id}")
    fun submitReport(
        @PathVariable id: Int,
    ): ResponseEntity<*> {
        val result = reportService.submitReport(id)
        return when (result) {
            is Success -> ResponseEntity.status(HttpStatus.OK).body(result.value)
            is Failure ->
                when (result.value) {
                    ReportError.ReportNotFound -> Problem.ReportNotFound.response(HttpStatus.NOT_FOUND)
                    ReportError.ReportAlreadySubmittedOrApproved -> Problem.ReportAlreadySubmittedOrApproved.response(HttpStatus.CONFLICT)
                    ReportError.MissingRequiredFields -> Problem.MissingRequiredFields.response(HttpStatus.BAD_REQUEST)
                    ReportError.TypeNotFound -> Problem.TypeNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    /**
     * Obtém um relatório pelo identificador da ocorrência.
     *
     * @param occurrenceId Identificador da ocorrência.
     *
     * @return `200 OK` com o relatório ou `404 Not Found` caso não exista.
     */
    @GetMapping("byOccurrence/{occurrenceId}")
    fun findReportByOccurrenceId(
        @PathVariable occurrenceId: Int,
    ): ResponseEntity<*> {
        val result = reportService.findByOccurrenceId(occurrenceId)
        return when (result) {
            is Success -> ResponseEntity.status(HttpStatus.OK).body(result.value)
            is Failure ->
                when (result.value) {
                    ReportError.ReportNotFound -> Problem.ReportNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    /**
     * Obtém todos os relatórios registados no sistema.
     *
     * @return `200 OK` com a lista completa de relatórios.
     */
    @GetMapping
    fun findAllReports(): ResponseEntity<*> {
        val reports = reportService.findAll()
        return ResponseEntity.status(HttpStatus.OK).body(reports)
    }

    /**
     * Obtém relatórios filtrados por estado.
     *
     * @param status estado do relatório.
     *
     * @return lista de relatórios correspondentes ao estado indicado.
     */
    @GetMapping("/byStatus/{status}")
    fun findByStatus(
        @PathVariable status: String,
    ): ResponseEntity<List<Report>> = ResponseEntity.ok(reportService.findByStatus(ReportStatus.valueOf(status)))

    /**
     * Obtém relatórios criados por um utilizador específico.
     *
     * @param creatorId identificador do utilizador criador.
     *
     * @return lista de relatórios associados ao utilizador.
     */
    @GetMapping("/byCreator/{creatorId}")
    fun findByCreator(
        @PathVariable creatorId: Int,
    ): ResponseEntity<List<Report>> = ResponseEntity.ok(reportService.findByCreatorId(creatorId))

    /**
     * Elimina um relatório pelo seu identificador.
     *
     * Em caso de sucesso, devolve `204 No Content`.
     *
     * @param id identificador do relatório.
     *
     * @return resposta HTTP correspondente ao resultado da operação.
     */
    @DeleteMapping("/{id}")
    fun deleteReportById(
        @PathVariable id: Int,
    ): ResponseEntity<*> {
        val result = reportService.deleteById(id)
        return when (result) {
            is Success -> ResponseEntity.status(HttpStatus.NO_CONTENT).build<Unit>()
            is Failure ->
                when (result.value) {
                    ReportError.ReportNotFound -> Problem.ReportNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    /**
     * Atualiza o estado de um relatório.
     *
     * @param id identificador do relatório.
     * @param newStatus novo estado a atribuir ao relatório.
     *
     * @return relatório atualizado ou erro de domínio mapeado.
     */
    @PostMapping("/update-status/{id}")
    fun updateReportStatus(
        @PathVariable id: Int,
        @RequestBody newStatus: StatusInput,
    ): ResponseEntity<*> {
        val result = reportService.updateStatus(id, ReportStatus.valueOf(newStatus.newStatus))
        return when (result) {
            is Success -> ResponseEntity.status(HttpStatus.OK).body(result.value)
            is Failure ->
                when (result.value) {
                    ReportError.ReportNotFound -> Problem.ReportNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    /**
     * Adiciona um editor a um relatório.
     *
     * @param id identificador do relatório.
     * @param editor identificador do editor a adicionar.
     *
     * @return relatório atualizado ou erro de domínio mapeado.
     */
    @PostMapping("/{id}/editors")
    fun addEditor(
        @PathVariable id: Int,
        @RequestBody editor: EditorInput,
    ): ResponseEntity<*> {
        val result = reportService.addEditor(id, editor.editorId)
        return when (result) {
            is Success -> ResponseEntity.status(HttpStatus.OK).body(result.value)
            is Failure ->
                when (result.value) {
                    is ReportError.ReportNotFound -> Problem.ReportNotFound.response(HttpStatus.NOT_FOUND)
                    is ReportError.UserNotFound -> Problem.UserNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    /**
     * Remove um editor de um relatório.
     *
     * @param id identificador do relatório.
     * @param editor identificador do editor a remover.
     *
     * @return relatório atualizado ou erro de domínio mapeado.
     */
    @DeleteMapping("/{id}/editors/")
    fun removeEditor(
        @PathVariable id: Int,
        @RequestBody editor: EditorInput,
    ): ResponseEntity<*> {
        val result = reportService.removeEditor(id, editor.editorId)
        return when (result) {
            is Success -> ResponseEntity.ok(result.value)
            is Failure ->
                when (result.value) {
                    is ReportError.ReportNotFound -> Problem.ReportNotFound.response(HttpStatus.NOT_FOUND)
                    is ReportError.UserNotFound -> Problem.UserNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    /**
     * Fornece um endpoint SSE para subscrição de atualizações de um relatório específico.
     *
     * Permite receber eventos em tempo real associados a alterações nesse relatório.
     *
     * Endpoint: GET /{reportId}/listen
     *
     * @param reportId identificador do relatório a observar.
     *
     * @return [SseEmitter] com ligação persistente para eventos.
     */
    @GetMapping("/{reportId}/listen")
    fun listen(
        @PathVariable reportId: Int,
    ): SseEmitter {
        val sseEmitter = SseEmitter(Long.MAX_VALUE)
        publisher.reportPublisher.addEmitter(
            reportId,
            SSEUpdatedDataAdapter(
                sseEmitter,
            ),
        )
        return sseEmitter
    }
}
