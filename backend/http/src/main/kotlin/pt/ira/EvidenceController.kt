package pt.ira

import com.fasterxml.jackson.databind.JsonNode
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import pt.ira.model.Problem
import pt.ira.model.evidence.CreateEvidenceInput

@RestController
@RequestMapping("/api/evidence")
class EvidenceController(
    private val evidenceService: EvidenceService,
) {
    @PostMapping
    fun createEvidence(
        @RequestBody evidenceInput: CreateEvidenceInput,
    ): ResponseEntity<*> {
        val result =
            evidenceService.createEvidence(
                evidenceInput.type,
                evidenceInput.filePath,
                evidenceInput.location,
                evidenceInput.description,
                evidenceInput.reporterId,
                evidenceInput.reportId,
            )
        return when (result) {
            is Success ->
                ResponseEntity
                    .status(HttpStatus.OK)
                    .header(
                        "Location",
                        "/api/evidence/${result.value.id}",
                    ).build<Unit>()
            is Failure ->
                when (result.value) {
                    is EvidenceError.ReportNotFound ->
                        Problem.ReportNotFound.response(HttpStatus.NOT_FOUND)
                    is EvidenceError.ReporterNotFound ->
                        Problem.ReporterNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    @GetMapping("/{id}")
    fun findById(id: Int): ResponseEntity<*> {
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

    @GetMapping("/byReport/{reportId}")
    fun findByReportId(
        @PathVariable reportId: Int,
    ): ResponseEntity<*> {
        val result = evidenceService.findByReportId(reportId)
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

                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }
}
