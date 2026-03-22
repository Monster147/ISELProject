package pt.ira.interfaces

import com.fasterxml.jackson.databind.JsonNode
import pt.ira.Intervenor
import pt.ira.Report
import pt.ira.ReportStatus
import pt.ira.User

interface RepositoryReport: Repository<Report> {
    fun createReport(
        creatorId: Int,
        title: String,
        description: String,
        type: JsonNode,
        addons: JsonNode,
    ): Report

    fun findByStatus(status: ReportStatus): List<Report>

    fun findByCreatorId(creatorId: Int): List<Report>

    fun findByEditor(userId: Int): List<Report>

    fun addEditor(
        report: Report,
        user: User
    ) : Report

    fun removeEditor(
        report: Report,
        user: User
    ) : Report

    fun updateStatus(
        report: Report,
        status: ReportStatus
    ) : Report

    fun findByType(type: JsonNode): List<Report>

    fun findByIntervenor(intervenor: Intervenor): List<Report>

    fun addIntervenor(
        report: Report,
        intervenor: Intervenor
    ) : Report

    fun removeIntervenor(
        report: Report,
        intervenor: Intervenor
    ) : Report
}