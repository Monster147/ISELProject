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
import pt.ira.model.occurrence.IntervenorIdInput
import pt.ira.model.occurrence.OccurrenceCreateInput
import pt.ira.occurrence.Occurrence
import pt.ira.occurrence.OccurrenceType
import pt.ira.publishers.Publishers

/**
 * Controlador REST responsável pela gestão de ocorrências no sistema.
 *
 * Expõe endpoints HTTP para criação, consulta, eliminação e atualização de ocorrências,
 * bem como para gestão de intervenientes associados e subscrição de eventos em tempo real
 * através de Server-Sent Events (SSE).
 *
 * Este controlador atua como camada de interface entre o protocolo HTTP e a lógica de domínio,
 * delegando toda a execução ao [OccurrenceService] e convertendo os resultados em respostas HTTP
 * normalizadas com mapeamento explícito de erros.
 *
 * Responsabilidades principais:
 * - criação e remoção de ocorrências;
 * - consulta por identificador, importância e utilizador responsável;
 * - associação e remoção de intervenientes numa ocorrência;
 * - listagem global de ocorrências;
 * - exposição de streams SSE para atualizações por ocorrência e globais;
 * - tradução de erros de domínio para respostas HTTP adequadas.
 *
 * @param occurrenceService serviço responsável pela lógica de negócio das ocorrências.
 * @param publisher conjunto de publicadores responsáveis por eventos e notificações SSE.
 */
@RestController
@RequestMapping("/api/occurrence")
class OccurrenceController(
    private val occurrenceService: OccurrenceService,
    private val publisher: Publishers,
) {
    /**
     * Cria uma ocorrência no sistema.
     *
     * Em caso de sucesso, devolve `201 Created` e o header `Location`
     * com a localização do recurso criado.
     *
     * @param occurrenceInput dados necessários para criação da ocorrência.
     *
     * @return resposta HTTP com o resultado da operação.
     */
    @PostMapping
    fun createOccurrence(
        @RequestBody occurrenceInput: OccurrenceCreateInput,
    ): ResponseEntity<*> {
        val result =
            occurrenceService.createOccurrence(
                usersId = occurrenceInput.usersId,
                endDate = occurrenceInput.endDate,
                importance = occurrenceInput.importance,
                occurrenceType = occurrenceInput.occurrenceType,
                occurrenceInfo = occurrenceInput.occurrenceInfo,
            )
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.CREATED)
                    .header(
                        "Location",
                        "/api/occurrence/${result.value.id}",
                    ).build<Unit>()
            is Failure ->
                when (result.value) {
                    OccurrenceError.EndDateNotValid -> Problem.EndDateNotValid.response(HttpStatus.BAD_REQUEST)
                    OccurrenceError.UserNotFound -> Problem.UserNotFound.response(HttpStatus.NOT_FOUND)
                    OccurrenceError.DuplicateUsersIds -> Problem.DuplicateUsersIds.response(HttpStatus.BAD_REQUEST)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    /**
     * Obtém uma ocorrência pelo seu identificador.
     *
     * @param occurrenceId identificador da ocorrência.
     *
     * @return `200 OK` com a ocorrência ou `404 Not Found` se não existir.
     */
    @GetMapping("/{occurrenceId}")
    fun findById(
        @PathVariable occurrenceId: Int,
    ): ResponseEntity<*> {
        val result = occurrenceService.findById(occurrenceId)
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(result.value)
            is Failure ->
                when (result.value) {
                    OccurrenceError.OccurrenceNotFound -> Problem.OccurrenceNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    /**
     * Obtém todas as ocorrências registadas no sistema.
     *
     * Em caso de sucesso, devolve a lista completa de ocorrências com `200 OK`.
     * Em caso de erro interno, devolve uma resposta de erro apropriada.
     *
     * @return `200 OK` com a lista de ocorrências ou erro interno do sistema.
     */
    @GetMapping
    fun findAll(): ResponseEntity<*> {
        val occurrences = occurrenceService.findAll()
        return when (occurrences) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(occurrences)
            is Failure ->
                when (occurrences.value) {
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    /**
     * Obtém ocorrências filtradas por nível de importância.
     *
     * @param importance nível de importância da ocorrência.
     *
     * @return lista de ocorrências correspondentes ao filtro.
     */
    @GetMapping("/importance/{importance}")
    fun findByImportance(
        @PathVariable importance: String,
    ): ResponseEntity<List<Occurrence>> = ResponseEntity.ok(occurrenceService.findByImportance(OccurrenceType.valueOf(importance)))

    /**
     * Obtém ocorrências associadas a um utilizador (reporter).
     *
     * @param reporterId identificador do utilizador responsável.
     *
     * @return lista de ocorrências associadas ao utilizador.
     */
    @GetMapping("/reporter/{reporterId}")
    fun findByReporterId(
        @PathVariable reporterId: Int,
    ): ResponseEntity<List<Occurrence>> = ResponseEntity.ok(occurrenceService.findOccurrenceByReporterId(reporterId))

    /**
     * Elimina uma ocorrência pelo seu identificador.
     *
     * Em caso de sucesso, devolve `204 No Content`.
     *
     * @param occurrenceId identificador da ocorrência.
     *
     * @return resposta HTTP correspondente ao resultado da operação.
     */
    @DeleteMapping("/{occurrenceId}")
    fun deleteById(
        @PathVariable occurrenceId: Int,
    ): ResponseEntity<*> {
        val result = occurrenceService.deleteById(occurrenceId)
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.NO_CONTENT)
                    .build<Unit>()
            is Failure ->
                when (result.value) {
                    OccurrenceError.OccurrenceNotFound -> Problem.OccurrenceNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    /**
     * Adiciona um interveniente a uma ocorrência.
     *
     * @param id identificador da ocorrência.
     * @param intervenor dados do interveniente a associar.
     *
     * @return ocorrência atualizada ou erro de domínio mapeado.
     */
    @PostMapping("/{id}/intervenors")
    fun addIntervenor(
        @PathVariable id: Int,
        @RequestBody intervenor: IntervenorIdInput,
    ): ResponseEntity<*> {
        val result = occurrenceService.addIntervenor(id, intervenor.intervenorId)
        return when (result) {
            is Success -> ResponseEntity.ok(result.value)
            is Failure ->
                when (result.value) {
                    is OccurrenceError.OccurrenceNotFound -> Problem.OccurrenceNotFound.response(HttpStatus.NOT_FOUND)
                    is OccurrenceError.IntervenorNotFound -> Problem.IntervenorNotFound.response(HttpStatus.NOT_FOUND)
                    is OccurrenceError.IntervenorAlreadyInOccurrence -> Problem.IntervenorAlreadyInOccurrence.response(HttpStatus.BAD_REQUEST)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    /**
     * Remove um interveniente de uma ocorrência.
     *
     * @param id identificador da ocorrência.
     * @param intervenor dados do interveniente a remover.
     *
     * @return ocorrência atualizada ou erro de domínio mapeado.
     */
    @DeleteMapping("/{id}/intervenors")
    fun removeIntervenor(
        @PathVariable id: Int,
        @RequestBody intervenor: IntervenorIdInput,
    ): ResponseEntity<*> {
        val result = occurrenceService.removeIntervenor(id, intervenor.intervenorId)
        return when (result) {
            is Success -> ResponseEntity.ok(result.value)
            is Failure ->
                when (result.value) {
                    is OccurrenceError.OccurrenceNotFound -> Problem.OccurrenceNotFound.response(HttpStatus.NOT_FOUND)
                    is OccurrenceError.IntervenorNotFound -> Problem.IntervenorNotFound.response(HttpStatus.NOT_FOUND)
                    is OccurrenceError.IntervenorNotInOccurrence -> Problem.IntervenorNotInOccurrence.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    /**
     * Fornece um endpoint SSE para subscrição de atualizações de uma ocorrência específica.
     *
     * Permite receber eventos em tempo real associados a alterações nessa ocorrência.
     *
     * Endpoint: GET /{occurrenceId}/listen
     *
     * @param occurrenceId identificador da ocorrência a observar.
     *
     * @return [SseEmitter] com ligação persistente para eventos.
     */
    @GetMapping("/{occurrenceId}/listen")
    fun listen(
        @PathVariable occurrenceId: Int,
    ): SseEmitter {
        val sseEmitter = SseEmitter(Long.MAX_VALUE)
        publisher.occurrencePublisher.addEmitter(
            occurrenceId,
            SSEUpdatedDataAdapter(
                sseEmitter,
            ),
        )
        return sseEmitter
    }

    /**
     * Fornece um endpoint SSE para subscrição de alterações na lista global de ocorrências.
     *
     * Permite receber eventos em tempo real sempre que a lista de ocorrências é atualizada.
     *
     * Endpoint: GET /listen
     *
     * @return [SseEmitter] com ligação persistente para eventos globais.
     */
    @GetMapping("/listen")
    fun listenIntervenors(): SseEmitter {
        val sseEmitter = SseEmitter(Long.MAX_VALUE)
        publisher.occurrencesPublisher.addEmitter(
            SSEUpdatedDataAdapter(
                sseEmitter,
            ),
        )
        return sseEmitter
    }
}
