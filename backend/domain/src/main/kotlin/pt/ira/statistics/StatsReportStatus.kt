package pt.ira.statistics

import pt.ira.report.ReportStatus

/**
 * Representa estatísticas agregadas dos relatórios pelo seu estado.
 *
 * Este modelo encapsula a distribuição de relatórios conforme o seu estado
 * (EDITING, SUBMITTED, APPROVED, REJECTED), fornecendo tanto o volume
 * absoluto como a percentagem relativa de cada estado, permitindo análise do progresso
 * e dos relatórios.
 *
 * @property status Estado atual do relatório (ex: EDITING, SUBMITTED, APPROVED).
 * @property count Número absoluto de relatórios que se encontram neste estado.
 * @property percentage Percentagem relativa deste estado face ao total de relatórios do sistema.
 *
 * @constructor Cria uma instância de [StatsReportStatus] com as métricas
 *              agregadas de um estado específico.
 */

data class StatsReportStatus(
    val status: ReportStatus,
    val count: Int,
    val percentage: Double,
)
