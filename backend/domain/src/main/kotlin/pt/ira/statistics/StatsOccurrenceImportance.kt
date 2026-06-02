package pt.ira.statistics

import pt.ira.occurrence.OccurrenceType

/**
 * Representa estatísticas agregadas das ocorrências pelo nível de importância.
 *
 * Este modelo encapsula a distribuição de ocorrências conforme o seu nível
 * de prioridade, fornecendo tanto o volume absoluto como a percentagem relativa
 * de cada categoria, permitindo uma análise comparativa da urgência das ocorrências.
 *
 * @property importance Nível de importância das ocorrências (ex: NORMAL, URGENT, CRITICAL).
 * @property count Número absoluto de ocorrências que pertencem a este nível de importância.
 * @property percentage Percentagem relativa deste nível face ao total de ocorrências do sistema.
 *
 * @constructor Cria uma instância de [StatsOccurrenceImportance] com as métricas
 *              agregadas de um nível de importância específico.
 */

data class StatsOccurrenceImportance(
    val importance: OccurrenceType,
    val count: Int,
    val percentage: Double,
)