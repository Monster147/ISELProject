package pt.ira.mem

import com.fasterxml.jackson.databind.JsonNode
import pt.ira.intervenor.Intervenor
import pt.ira.report.Report
import pt.ira.report.ReportStatus
import pt.ira.user.User
import pt.ira.interfaces.RepositoryReport

class RepositoryReportMem: RepositoryReport {
    private val reports = mutableListOf<Report>()

    override fun createReport(
        creatorId: Int,
        title: String,
        description: String,
        type: JsonNode,
        addons: JsonNode
    ): Report = Report(
        id = reports.size + 1,
        creatorId = creatorId,
        title = title,
        description = description,
        type = type,
        addons = addons,
    ).also{ reports.add(it) }

    override fun findByStatus(status: ReportStatus): List<Report> =
        reports.filter { it.status == status }

    override fun findByCreatorId(creatorId: Int): List<Report> =
        reports.filter { it.creatorId == creatorId }

    override fun findByEditor(userId: Int): List<Report> =
        reports.filter {
            it.editors.any { editor -> editor == userId }
        }

    override fun addEditor(report: Report, user: User): Report {
        if (report.editors.any { it == user.id }) return report
        val updatedReport = report.copy(editors = report.editors + user.id, updatedAt = System.currentTimeMillis())
        save(updatedReport)
        return updatedReport
    }

    override fun removeEditor(report: Report, user: User): Report {
        if (report.editors.none { it == user.id }) return report
        val updatedReport = report.copy(
            editors = report.editors - user.id,
            updatedAt = System.currentTimeMillis()
        )
        save(updatedReport)
        return updatedReport
    }

    override fun updateStatus(report: Report, status: ReportStatus): Report{
        val updatedReport = report.copy(status = status, updatedAt = System.currentTimeMillis())
        save(updatedReport)
        return updatedReport
    }

    override fun findByType(type: JsonNode): List<Report> =
        reports.filter { it.type == type }

    override fun findByIntervenor(intervenor: Intervenor): List<Report> =
        reports.filter{ it.intervenors.contains(intervenor.id) }

    override fun addIntervenor(report: Report, intervenor: Intervenor): Report {
        if (report.intervenors.any { it == intervenor.id }) return report
        val updated = report.copy(
            intervenors = report.intervenors + intervenor.id,
            updatedAt = System.currentTimeMillis()
        )
        save(updated)
        return updated
    }

    override fun removeIntervenor(report: Report, intervenor: Intervenor): Report {
        if (report.intervenors.none { it == intervenor.id }) return report
        val updated = report.copy(
            intervenors = report.intervenors - intervenor.id,
            updatedAt = System.currentTimeMillis()
        )
        save(updated)
        return updated
    }

    override fun findById(id: Int): Report? = reports.find { it.id == id }

    override fun findAll(): List<Report> = reports.toList()

    override fun save(entity: Report) {
        reports.removeIf { it.id == entity.id }
        reports.add(entity)
    }

    override fun deleteById(id: Int) {
        reports.removeIf { it.id == id }
    }

    override fun clear() {
        reports.clear()
    }
}