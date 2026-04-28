package pt.ira

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/stats")
class StatsController (
    private val statsService: StatisticsService
) {

    @GetMapping
    fun getOverviewStats() : ResponseEntity<*> {
        val statsOverview = statsService.getOverviewStatistics()
        return ResponseEntity.ok(statsOverview)
    }

    @GetMapping("/report/type")
    fun getStatsReportByType() : ResponseEntity<*> {
        val statsReportByType = statsService.getStatsReportByType()
        return ResponseEntity.ok(statsReportByType)
    }

    @GetMapping("/report/status")
    fun getStatsReportByStatus() : ResponseEntity<*> {
        val statsReportByStatus = statsService.getStatsReportByStatus()
        return ResponseEntity.ok(statsReportByStatus)
    }

    @GetMapping("/occurrence/importance")
    fun getStatsOccurrenceByImportance() : ResponseEntity<*> {
        val statsOccurrenceByImportance = statsService.getStatsOccurrenceByImportance()
        return ResponseEntity.ok(statsOccurrenceByImportance)
    }

    @GetMapping("/report/type/month")
    fun getStatsReportByTypeThisMonth() : ResponseEntity<*> {
        val statsReportByType = statsService.getStatsReportByTypeThisMonth()
        return ResponseEntity.ok(statsReportByType)
    }

    @GetMapping("/report/status/month")
    fun getStatsReportByStatusThisMonth() : ResponseEntity<*> {
        val statsReportByStatus = statsService.getStatsReportByStatusThisMonth()
        return ResponseEntity.ok(statsReportByStatus)

    }

    @GetMapping("/occurrence/importance/month")
    fun getStatsOccurrenceByImportanceThisMonth() : ResponseEntity<*> {
        val statsReportByStatus = statsService.getStatsOccurrenceByImportanceThisMonth()
        return ResponseEntity.ok(statsReportByStatus)
    }
}