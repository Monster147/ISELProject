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
import pt.ira.model.Problem
import pt.ira.model.occurrence.OccurrenceCreateInput
import pt.ira.occurrence.Occurrence
import pt.ira.occurrence.OccurrenceType
import pt.ira.report.ReportStatus
import java.time.LocalDate

@RestController
@RequestMapping("/api/occurrence")
class OccurrenceController(
    private val occurrenceService: OccurrenceService
) {

    @PostMapping
    fun createOccurrence(
        @RequestBody occurrenceInput: OccurrenceCreateInput
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
                        "/api/occurrence/${result.value.id}"
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
        @PathVariable occurrenceId: Int
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
        return ResponseEntity.status(HttpStatus.OK).body(occurrences)
    }

    @GetMapping("/importance/{importance}")
    fun findByImportance(
        @PathVariable importance: String
    ): ResponseEntity<List<Occurrence>> =ResponseEntity.ok(occurrenceService.findByImportance(OccurrenceType.valueOf(importance)))

    @GetMapping("/reporter/{reporterId}")
    fun findByReporterId(
        @PathVariable reporterId: Int
    ): ResponseEntity<List<Occurrence>> =ResponseEntity.ok(occurrenceService.findOccurrenceByReporterId(reporterId))

    @DeleteMapping("/{occurrenceId}")
    fun deleteById(
        @PathVariable occurrenceId: Int
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
}