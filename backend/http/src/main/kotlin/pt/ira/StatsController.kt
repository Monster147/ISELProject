package pt.ira

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 * Controlador REST responsável pela exposição de endpoints das estatísticas do sistema.
 *
 * Fornece acesso a métricas agregadas relacionadas com utilizadores, ocorrências e relatórios,
 * tanto em escala global como filtradas por período mensal. Atua como camada de adaptação
 * entre o protocolo HTTP e a lógica de negócio, delegando toda a execução ao [StatisticsService].
 *
 * Responsabilidades principais:
 * - Exposição de estatísticas globais de utilizadores, ocorrências e relatórios;
 * - Aggregate de distribuição de relatórios por tipo e estado;
 * - Análise de distribuição de ocorrências por nível de importância;
 * - Filtros temporais (período mensal atual) para análise de tendências;
 * - Tradução de resultados em respostas HTTP com status apropriado.
 *
 * @param statsService Serviço responsável pela lógica de cálculo das estatísticas.
 */

@RestController
@RequestMapping("/api/stats")
class StatsController(
    private val statsService: StatisticsService,
) {
    /**
     * Obtém um resumo geral de estatísticas do sistema.
     *
     * Retorna métricas agregadas globais incluindo o total de utilizadores,
     * ocorrências, relatórios e evidências registadas.
     *
     * @return `200 OK` com uma instância de [OverviewStats].
     */
    @GetMapping
    fun getOverviewStats(): ResponseEntity<*> {
        val statsOverview = statsService.getOverviewStatistics()
        return ResponseEntity.ok(statsOverview)
    }

    /**
     * Obtém a distribuição de relatórios por tipo.
     *
     * @return `200 OK` com uma lista de [StatsReportType] mostrando contagens e percentagens.
     */
    @GetMapping("/report/type")
    fun getStatsReportByType(): ResponseEntity<*> {
        val statsReportByType = statsService.getStatsReportByType()
        return ResponseEntity.ok(statsReportByType)
    }

    /**
     * Obtém a distribuição de relatórios por estado.
     *
     * @return `200 OK` com uma lista de [StatsReportStatus] mostrando contagens e percentagens.
     */
    @GetMapping("/report/status")
    fun getStatsReportByStatus(): ResponseEntity<*> {
        val statsReportByStatus = statsService.getStatsReportByStatus()
        return ResponseEntity.ok(statsReportByStatus)
    }

    /**
     * Obtém a distribuição de ocorrências por nível de importância.
     *
     * @return `200 OK` com uma lista de [StatsOccurrenceImportance] mostrando contagens e percentagens.
     */
    @GetMapping("/occurrence/importance")
    fun getStatsOccurrenceByImportance(): ResponseEntity<*> {
        val statsOccurrenceByImportance = statsService.getStatsOccurrenceByImportance()
        return ResponseEntity.ok(statsOccurrenceByImportance)
    }

    /**
     * Obtém a distribuição de relatórios por tipo referente ao mês atual.
     *
     * @return `200 OK` com uma lista de [StatsReportType] filtrada para o mês corrente.
     */
    @GetMapping("/report/type/month")
    fun getStatsReportByTypeThisMonth(): ResponseEntity<*> {
        val statsReportByType = statsService.getStatsReportByTypeThisMonth()
        return ResponseEntity.ok(statsReportByType)
    }

    /**
     * Obtém a distribuição de relatórios por estado referente ao mês atual.
     *
     * @return `200 OK` com uma lista de [StatsReportStatus] filtrada para o mês corrente.
     */
    @GetMapping("/report/status/month")
    fun getStatsReportByStatusThisMonth(): ResponseEntity<*> {
        val statsReportByStatus = statsService.getStatsReportByStatusThisMonth()
        return ResponseEntity.ok(statsReportByStatus)
    }

    /**
     * Obtém a distribuição de ocorrências por importância referente ao mês atual.
     *
     * @return `200 OK` com uma lista de [StatsOccurrenceImportance] filtrada para o mês corrente.
     */
    @GetMapping("/occurrence/importance/month")
    fun getStatsOccurrenceByImportanceThisMonth(): ResponseEntity<*> {
        val statsReportByStatus = statsService.getStatsOccurrenceByImportanceThisMonth()
        return ResponseEntity.ok(statsReportByStatus)
    }
}
