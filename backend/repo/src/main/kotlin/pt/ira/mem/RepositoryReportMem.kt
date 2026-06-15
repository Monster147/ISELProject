package pt.ira.mem

import com.fasterxml.jackson.databind.JsonNode
import pt.ira.interfaces.RepositoryReport
import pt.ira.report.Report
import pt.ira.report.ReportStatus
import pt.ira.user.User

class RepositoryReportMem : RepositoryReport {
    private val reports = mutableListOf<Report>()

    override fun createReport(
        creatorId: Int,
        occurrenceId: Int,
        title: String,
        description: String,
        type: Int,
        addons: JsonNode,
        intervenors: List<Int>,
        language: String,
        filePath: String,
    ): Report =
        Report(
            id = reports.size + 1,
            creatorId = creatorId,
            occurrenceId = occurrenceId,
            title = title,
            description = description,
            type = type,
            addons = addons,
            editors = listOf(creatorId),
            intervenors = intervenors,
            language = language,
            filePath = filePath,
        ).also { reports.add(it) }

    override fun findByOccurrenceId(occurrenceId: Int): Report? = reports.find { it.occurrenceId == occurrenceId }

    override fun findByStatus(status: ReportStatus): List<Report> = reports.filter { it.status == status }

    override fun findByCreatorId(creatorId: Int): List<Report> = reports.filter { it.creatorId == creatorId }

    override fun findByEditor(userId: Int): List<Report> = reports.filter { userId in it.editors }

    override fun addEditor(
        report: Report,
        user: User,
    ): Report {
        if (user.id in report.editors) return report
        val updatedReport = report.copy(editors = report.editors + user.id, updatedAt = System.currentTimeMillis())
        save(updatedReport)
        return updatedReport
    }

    override fun removeEditor(
        report: Report,
        user: User,
    ): Report {
        if (user.id !in report.editors) return report
        val updatedReport =
            report.copy(
                editors = report.editors - user.id,
                updatedAt = System.currentTimeMillis(),
            )
        save(updatedReport)
        return updatedReport
    }

    override fun updateStatus(
        report: Report,
        status: ReportStatus,
    ): Report {
        if (status == report.status) return report
        val updatedReport = report.copy(status = status, updatedAt = System.currentTimeMillis())
        save(updatedReport)
        return updatedReport
    }

    override fun findByType(type: Int): List<Report> = reports.filter { it.type == type }

    override fun findById(id: Int): Report? = reports.find { it.id == id }

    override fun findAll(): List<Report> = reports.toList()

    override fun save(entity: Report) {
        val idx = reports.indexOfFirst { it.id == entity.id }
        if (idx >= 0) {
            reports[idx] = entity
        } else {
            reports.add(entity)
        }
    }

    override fun deleteById(id: Int) {
        reports.removeIf { it.id == id }
    }

    override fun clear() = reports.clear()
}
