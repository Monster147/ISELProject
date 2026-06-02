package pt.ira

import org.springframework.stereotype.Component
import pt.ira.interfaces.TransactionManager
import pt.ira.occurrence.Occurrence
import pt.ira.report.Report
import pt.ira.statistics.OverviewStats
import pt.ira.statistics.StatsOccurrenceImportance
import pt.ira.statistics.StatsReportStatus
import pt.ira.statistics.StatsReportType
import java.time.Instant
import java.time.YearMonth
import java.time.ZoneId
import kotlin.math.round

/**
 * Serviço responsável pelo cálculo e agregação de estatísticas do sistema.
 *
 * Responsabilidades principais:
 * - Cálculo de métricas globais (utilizadores, ocorrências, relatórios, evidências);
 * - Agregação de dados por categorias (tipo, estado, importância);
 * - Filtragem temporal de dados para análise de tendências mensais;
 * - Cálculo de percentagens arredondadas para apresentação clara;
 * - Fornecimento de dados para dashboards e relatórios analíticos.
 *
 * @param trxManager Gestor de transações usado para aceder aos repositórios dentro de unidades de trabalho.
 */
@Component
class StatisticsService(
    private val trxManager: TransactionManager,
){
    /**
     * Obtém um resumo global de estatísticas do sistema.
     *
     * Calcula o total de utilizadores, ocorrências, relatórios e evidências registadas.
     *
     * @return [OverviewStats] contendo as métricas agregadas globais.
     */
    fun getOverviewStatistics(): OverviewStats = trxManager.run {
        val totalUsers = repoUsers.findAll().size
        val totalOccurrences = repoOccurrence.findAll().size
        val totalReports = repoReport.findAll().size
        val totalEvidences = repoEvidence.findAll().size

        OverviewStats(
            totalUsers = totalUsers,
            totalOccurrences = totalOccurrences,
            totalReports = totalReports,
            totalEvidences = totalEvidences,
        )
    }

    /**
     * Obtém a distribuição de relatórios por tipo em todo o sistema.
     *
     * Agrupa os relatórios por tipo e calcula o volume absoluto e a percentagem
     * relativa de cada tipo face ao total.
     *
     * @return Lista de [StatsReportType] com distribuição agregada.
     */
    fun getStatsReportByType(): List<StatsReportType> = trxManager.run {
        val reports = repoReport.findAll()
        if (reports.isEmpty()) return@run emptyList()
        val totalReports = reports.size.toDouble()
        reports
            .groupBy { it.type }
            .map { (type, group) ->
                val count = group.size
                val rawPercentage = (count / totalReports) * 100.0
                val rounded = round(rawPercentage * 10) / 10
                StatsReportType(
                    type = type,
                    count = count,
                    percentage = rounded
                )
            }
    }

    /**
     * Obtém a distribuição de relatórios por estado em todo o sistema.
     *
     * Agrupa os relatórios por estado, calcula o volume absoluto
     * e a percentagem relativa de cada estado face ao total.
     *
     * @return Lista de [StatsReportStatus] com distribuição agregada.
     */
    fun getStatsReportByStatus(): List<StatsReportStatus> = trxManager.run {
        val reports = repoReport.findAll()
        if (reports.isEmpty()) return@run emptyList()
        val totalReports = reports.size.toDouble()
        reports
            .groupBy { it.status }
            .map { (status, group) ->
                val count = group.size
                val rawPercentage = (count / totalReports) * 100.0
                val rounded = round(rawPercentage * 10) / 10
                StatsReportStatus(
                    status = status,
                    count = count,
                    percentage = rounded
                )
            }
    }

    /**
     * Obtém a distribuição de ocorrências por nível de importância em todo o sistema.
     *
     * Agrupa as ocorrências por importância e calcula o volume absoluto e a percentagem
     * relativa de cada nível face ao total.
     *
     * @return Lista de [StatsOccurrenceImportance] com distribuição agregada.
     */
    fun getStatsOccurrenceByImportance(): List<StatsOccurrenceImportance> =  trxManager.run {
        val occurrences = repoOccurrence.findAll()
        if (occurrences.isEmpty()) return@run emptyList()
        val totalOccurrences = occurrences.size.toDouble()
        occurrences
            .groupBy { it.importance }
            .map { (importance, group) ->
                val count = group.size
                val rawPercentage = (count / totalOccurrences) * 100.0
                val rounded = round(rawPercentage * 10) / 10
                StatsOccurrenceImportance(
                    importance = importance,
                    count = count,
                    percentage = rounded
                )
            }
    }

    /**
     * Obtém a distribuição de relatórios por tipo referente ao mês atual.
     *
     * Filtra os relatórios criados no mês corrente e agrupa por tipo,
     * calculando volume absoluto e percentagem relativa.
     *
     * @return Lista de [StatsReportType] filtrada para o mês corrente.
     */
    fun getStatsReportByTypeThisMonth(): List<StatsReportType> = trxManager.run {
        val reports = repoReport.findAll()
        if (reports.isEmpty()) return@run emptyList()
        val reportsThisMonth = getCurrentMonthReports(reports)
        if (reportsThisMonth.isEmpty()) return@run emptyList()
        val totalReports = reportsThisMonth.size.toDouble()
        reportsThisMonth
            .groupBy { it.type }
            .map { (type, group) ->
                val count = group.size
                val rawPercentage = (count / totalReports) * 100.0
                val rounded = round(rawPercentage * 10) / 10
                StatsReportType(
                    type = type,
                    count = count,
                    percentage = rounded
                )
            }
    }

    /**
     * Obtém a distribuição de relatórios por estado referente ao mês atual.
     *
     * Filtra os relatórios criados no mês corrente e agrupa por estado,
     * calculando volume absoluto e percentagem relativa.
     *
     * @return Lista de [StatsReportStatus] filtrada para o mês corrente.
     */
    fun getStatsReportByStatusThisMonth(): List<StatsReportStatus> = trxManager.run {
        val reports = repoReport.findAll()
        if (reports.isEmpty()) return@run emptyList()
        val reportsThisMonth = getCurrentMonthReports(reports)
        if (reportsThisMonth.isEmpty()) return@run emptyList()
        val totalReports = reportsThisMonth.size.toDouble()
        reportsThisMonth
            .groupBy { it.status }
            .map { (status, group) ->
                val count = group.size
                val rawPercentage = (count / totalReports) * 100.0
                val rounded = round(rawPercentage * 10) / 10
                StatsReportStatus(
                    status = status,
                    count = count,
                    percentage = rounded
                )
            }
    }

    /**
     * Obtém a distribuição de ocorrências por importância referente ao mês atual.
     *
     * Filtra as ocorrências criadas no mês corrente e agrupa por importância,
     * calculando volume absoluto e percentagem relativa.
     *
     * @return Lista de [StatsOccurrenceImportance] filtrada para o mês corrente.
     */
    fun getStatsOccurrenceByImportanceThisMonth(): List<StatsOccurrenceImportance> =  trxManager.run {
        val occurrences = repoOccurrence.findAll()
        if (occurrences.isEmpty()) return@run emptyList()
        val occurrenceThisMonth = getCurrentMonthOccurrence(occurrences)
        if (occurrenceThisMonth.isEmpty()) return@run emptyList()
        val totalOccurrences = occurrenceThisMonth.size.toDouble()
        occurrenceThisMonth
            .groupBy { it.importance }
            .map { (importance, group) ->
                val count = group.size
                val rawPercentage = (count / totalOccurrences) * 100.0
                val rounded = round(rawPercentage * 10) / 10
                StatsOccurrenceImportance(
                    importance = importance,
                    count = count,
                    percentage = rounded
                )
            }
    }

    /**
     * Filtra os relatórios criados no mês e ano atual.
     *
     * @param reports Lista completa de relatórios a filtrar.
     * @return Lista de relatórios criados no mês corrente.
     */
    private fun getCurrentMonthReports(reports: List<Report>): List<Report> {
        val zone = ZoneId.systemDefault()
        val month = YearMonth.now(zone)
        return reports.filter {
            val reportMonth = YearMonth.from(
                Instant.ofEpochMilli(it.createdAt).atZone(zone)
            )
            reportMonth == month
        }
    }

    /**
     * Filtra as ocorrências criadas no mês e ano atual.
     *
     * @param reports Lista completa de ocorrências a filtrar.
     * @return Lista de ocorrências criadas no mês corrente.
     */
    private fun getCurrentMonthOccurrence(reports: List<Occurrence>): List<Occurrence> {
        val zone = ZoneId.systemDefault()
        val month = YearMonth.now(zone)
        return reports.filter {
            val occurrenceMonth = YearMonth.from(it.initDate)
            occurrenceMonth == month
        }
    }
}
