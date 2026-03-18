package pt.ira.mem

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import pt.ira.Intervenor
import pt.ira.PasswordValidationInfo
import pt.ira.Report
import pt.ira.ReportStatus
import pt.ira.Role
import pt.ira.User
import pt.ira.interfaces.RepositoryReport

class RepositoryReportMem: RepositoryReport {
    private val reports = mutableListOf<Report>()

    override fun createReport(
        creatorId: Int?,
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
            it.editors.any { editor -> editor.id == userId }
        }

    override fun addEditor(reportId: Int, user: User): Boolean {
        val report = findById(reportId) ?: return false
        if (report.editors.any { it.id == user.id }) return false

        return updateReport(reportId) {
            it.copy(editors = it.editors + user)
        }
    }

    override fun removeEditor(reportId: Int, userId: Int): Boolean {
        val report = findById(reportId) ?: return false
        if (report.editors.none { it.id == userId }) return false

        return updateReport(reportId) {
            it.copy(editors = it.editors.filterNot { editor -> editor.id == userId })
        }
    }

    override fun updateStatus(reportId: Int, status: ReportStatus): Boolean {
        return updateReport(reportId) {
            it.copy(status = status)
        }
    }

    override fun findByType(type: JsonNode): List<Report> =
        reports.filter { it.type == type }

    override fun findByIntervenor(intervenor: Intervenor): List<Report> =
        reports.filter{ it.intervenors.contains(intervenor) }

    override fun addIntervenor(reportId: Int, intervenor: Intervenor): Boolean {
        val report = findById(reportId) ?: return false
        if (report.intervenors.any { it.id == intervenor.id }) return false

        return updateReport(reportId) {
            it.copy(intervenors = it.intervenors + intervenor)
        }
    }

    override fun removeIntervenor(reportId: Int, intervenor: Intervenor): Boolean {
        val report = findById(reportId) ?: return false
        if (report.intervenors.none { it.id == intervenor.id }) return false

        return updateReport(reportId) {
            it.copy(intervenors = it.intervenors.filterNot { i -> i.id == intervenor.id })
        }
    }

    override fun findById(id: Int): Report? = reports.find { it.id == id }

    override fun findAll(): List<Report> = reports.toList()

    override fun save(entity: Report) {
        reports.removeIf { it.id == entity.id }
        reports.add(entity)
    }

    override fun deleteById(id: Int): Boolean = reports.removeIf { it.id == id }

    override fun clear() {
        reports.clear()
    }

    private fun updateReport(
        reportId: Int,
        updater: (Report) -> Report
    ): Boolean {
        val currReport = reports.find { it.id == reportId } ?: return false
        val updatedReport = updater(currReport).copy(updatedAt = System.currentTimeMillis())
        save(updatedReport)
        return true
    }
}