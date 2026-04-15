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

@RestController
@RequestMapping("/api/occurrence")
class OccurrenceController(
    private val occurrenceService: OccurrenceService,
    private val publisher: Publishers,
) {
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

    @GetMapping("/importance/{importance}")
    fun findByImportance(
        @PathVariable importance: String,
    ): ResponseEntity<List<Occurrence>> = ResponseEntity.ok(occurrenceService.findByImportance(OccurrenceType.valueOf(importance)))

    @GetMapping("/reporter/{reporterId}")
    fun findByReporterId(
        @PathVariable reporterId: Int,
    ): ResponseEntity<List<Occurrence>> = ResponseEntity.ok(occurrenceService.findOccurrenceByReporterId(reporterId))

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
     * Fornece um endpoint SSE para escuta de atualizações de uma occurrence.
     *
     * Endpoint: GET /{occurrenceId}/listen
     *
     * @param occurrenceId identificador da occurrence cujas atualizações se pretende subscrever.
     * @return `SseEmitter` com tempo de vida prolongado.
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
     * Fornece um endpoint SSE para escuta de alterações na lista de occurrences.
     *
     * Endpoint: GET /listen
     *
     * @return `SseEmitter` com tempo de vida prolongado.
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
