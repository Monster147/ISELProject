package pt.ira.interfaces

import com.fasterxml.jackson.databind.JsonNode
import pt.ira.Intervenor
import pt.ira.Report
import pt.ira.ReportStatus
import pt.ira.User

interface RepositoryReport: Repository<Report> {
    fun createReport(
        creatorId: Int?,
        title: String,
        description: String,
        type: JsonNode,
        addons: JsonNode,
    ): Report

    fun findByStatus(status: ReportStatus): List<Report>

    fun findByCreatorId(creatorId: Int): List<Report>

    fun findByEditor(userId: Int): List<Report>

    fun addEditor(
        reportId: Int,
        user: User
    ): Boolean

    fun removeEditor(
        reportId: Int,
        userId: Int
    ): Boolean

    fun updateStatus(
        reportId: Int,
        status: ReportStatus
    ): Boolean

    fun findByType(type: JsonNode): List<Report>

    fun findByIntervenor(intervenor: Intervenor): List<Report>

    fun addIntervenor(
        reportId: Int,
        intervenor: Intervenor
    ): Boolean

    fun removeIntervenor(
        reportId: Int,
        intervenor: Intervenor
    ) : Boolean
}