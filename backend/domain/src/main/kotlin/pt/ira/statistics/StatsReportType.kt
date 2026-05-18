package pt.ira.statistics

/**
 * Representa estatísticas agregadas dos relatórios pelo tipo.
 *
 * Este modelo encapsula a distribuição de relatórios de acordo com a sua
 * categoria, fornecendo tanto o volume absoluto como a percentagem relativa de cada tipo,
 * permitindo uma análise comparativa dos diferentes tipos de relatórios.
 *
 * @property type Identificador do tipo do relatório.
 * @property count Número absoluto de relatórios que pertencem a este tipo.
 * @property percentage Percentagem relativa deste tipo face ao total de relatórios do sistema.
 *
 * @constructor Cria uma instância de [StatsReportType] com as métricas
 *              agregadas de um tipo do relatório.
 */

data class StatsReportType(
    val type: Int,
    val count: Int,
    val percentage: Double,
)
