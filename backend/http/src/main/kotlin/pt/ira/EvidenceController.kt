package pt.ira

import com.fasterxml.jackson.databind.JsonNode
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestPart
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter
import pt.ira.model.Problem
import pt.ira.model.evidence.CreateEvidenceInput
import pt.ira.publishers.Publishers

@RestController
@RequestMapping("/api/evidence")
class EvidenceController(
    private val evidenceService: EvidenceService,
    private val publisher: Publishers,
) {
    @PostMapping(consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun createEvidence(
        @RequestPart("file") file: MultipartFile,
        @RequestPart("data") data: CreateEvidenceInput,
    ): ResponseEntity<*> {
        val result =
            evidenceService.createEvidence(
                data.type,
                file,
                data.location,
                data.description,
                data.reporterId,
                data.occurrenceId,
            )
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.CREATED)
                    .header(
                        "Location",
                        "/api/evidence/${result.value.id}",
                    ).build<Unit>()
            is Failure ->
                when (result.value) {
                    is EvidenceError.OccurrenceNotFound ->
                        Problem.OccurrenceNotFound.response(HttpStatus.NOT_FOUND)
                    is EvidenceError.ReporterNotFound ->
                        Problem.ReporterNotFound.response(HttpStatus.NOT_FOUND)
                    is EvidenceError.InvalidFile ->
                        Problem.InvalidFile.response(HttpStatus.BAD_REQUEST)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    @GetMapping("/{id}")
    fun findById(
        @PathVariable id: Int,
    ): ResponseEntity<*> {
        val result = evidenceService.findById(id)
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .body(result.value)

            is Failure ->
                when (result.value) {
                    is EvidenceError.EvidenceNotFound ->
                        Problem.EvidenceNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    @GetMapping("/{id}/download")
    fun downloadEvidence(
        @PathVariable id: Int,
    ): ResponseEntity<*> {
        val result = evidenceService.downloadEvidence(id)
        return when (result) {
            is Success -> {
                val (evidence, resource) = result.value

                val filename = evidence.filePath.substringAfterLast("/")

                ResponseEntity.ok()
                    .header(
                        "Content-Disposition",
                        "attachment; filename=\"$filename\"",
                    )
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource)
            }

            is Failure ->
                when (result.value) {
                    is EvidenceError.EvidenceNotFound ->
                        Problem.EvidenceNotFound.response(HttpStatus.NOT_FOUND)
                    is EvidenceError.FileNotFound ->
                        Problem.FileNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    @GetMapping("/byOccurrence/{occurrenceId}")
    fun findByOccurrenceId(
        @PathVariable occurrenceId: Int,
    ): ResponseEntity<*> {
        val result = evidenceService.findByOccurrenceId(occurrenceId)
        return ResponseEntity
            .status(HttpStatus.OK)
            .body(result)
    }

    @GetMapping("/byReporter/{reporterId}")
    fun findByReporterId(
        @PathVariable reporterId: Int,
    ): ResponseEntity<*> {
        val result = evidenceService.findByReporterId(reporterId)
        return ResponseEntity
            .status(HttpStatus.OK)
            .body(result)
    }

    @GetMapping("/byType")
    fun findByType(
        @RequestBody type: JsonNode,
    ): ResponseEntity<*> {
        val result = evidenceService.findByType(type)
        return ResponseEntity
            .status(HttpStatus.OK)
            .body(result)
    }

    @GetMapping("/byLocation/{location}")
    fun findByLocation(
        @PathVariable location: String,
    ): ResponseEntity<*> {
        val result = evidenceService.findByLocation(location)
        return ResponseEntity
            .status(HttpStatus.OK)
            .body(result)
    }

    @GetMapping
    fun findAll(): ResponseEntity<*> {
        val result = evidenceService.findAll()
        return ResponseEntity
            .status(HttpStatus.OK)
            .body(result)
    }

    @DeleteMapping("/{id}")
    fun deleteEvidence(
        @PathVariable id: Int,
    ): ResponseEntity<*> {
        val result = evidenceService.deleteById(id)
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.NO_CONTENT)
                    .build<Unit>()

            is Failure ->
                when (result.value) {
                    is EvidenceError.EvidenceNotFound ->
                        Problem.EvidenceNotFound.response(HttpStatus.NOT_FOUND)
                    is EvidenceError.OccurrenceNotFound ->
                        Problem.OccurrenceNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    /**
     * Fornece um endpoint SSE para escuta de atualizações de uma evidence.
     *
     * Endpoint: GET /{evidenceId}/listen
     *
     * @param evidenceId identificador da evidence cujas atualizações se pretende subscrever.
     * @return `SseEmitter` com tempo de vida prolongado.
     */
    @GetMapping("/{evidenceId}/listen")
    fun listen(
        @PathVariable evidenceId: Int,
    ): SseEmitter {
        val sseEmitter = SseEmitter(Long.MAX_VALUE)
        publisher.evidencePublisher.addEmitter(
            evidenceId,
            SSEUpdatedDataAdapter(
                sseEmitter,
            ),
        )
        return sseEmitter
    }
}
