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
import pt.ira.model.report.CreateReportInput
import pt.ira.report.Report
import pt.ira.report.ReportStatus

@RestController
@RequestMapping("/api/report")
class ReportController(
    private val reportService: ReportService,
) {
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
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

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

    @GetMapping
    fun findAllReports(): ResponseEntity<*> {
        val reports = reportService.findAll()
        return ResponseEntity.status(HttpStatus.OK).body(reports)
    }

    @GetMapping("/byStatus/{status}")
    fun findByStatus(
        @PathVariable status: String,
    ): ResponseEntity<List<Report>> = ResponseEntity.ok(reportService.findByStatus(ReportStatus.valueOf(status)))

    @GetMapping("/byCreator/{creatorId}")
    fun findByCreator(
        @PathVariable creatorId: Int,
    ): ResponseEntity<List<Report>> = ResponseEntity.ok(reportService.findByCreatorId(creatorId))

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

    @PostMapping("/update-status/{id}")
    fun updateReportStatus(
        @PathVariable id: Int,
        @RequestBody newStatus: String,
    ): ResponseEntity<*> {
        val result = reportService.updateStatus(id, ReportStatus.valueOf(newStatus))
        return when (result) {
            is Success -> ResponseEntity.status(HttpStatus.OK).body(result.value)
            is Failure ->
                when (result.value) {
                    ReportError.ReportNotFound -> Problem.ReportNotFound.response(HttpStatus.NOT_FOUND)
                    else -> Problem.InternalError.response(HttpStatus.INTERNAL_SERVER_ERROR)
                }
        }
    }

    @PostMapping("/{id}/editors")
    fun addEditor(
        @PathVariable id: Int,
        @RequestBody userId: Int,
    ): ResponseEntity<*> {
        val result = reportService.addEditor(id, userId)
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

    @DeleteMapping("/{id}/editors/")
    fun removeEditor(
        @PathVariable id: Int,
        @RequestBody userId: Int,
    ): ResponseEntity<*> {
        val result = reportService.removeEditor(id, userId)
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
}
