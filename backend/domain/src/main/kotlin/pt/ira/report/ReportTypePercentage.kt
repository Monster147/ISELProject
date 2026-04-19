package pt.ira.report

/**
 * Representa métricas agregadas de relatórios por tipo.
 *
 * Usado tipicamente em análises estatísticas para mostrar a distribuição de relatórios
 * por categorias.
 *
 * @property type Tipo do relatório em formato Int (mesma estrutura usada em [Report]).
 * @property count Número absoluto de relatórios deste tipo.
 * @property percentage Percentagem que este tipo representa no total de relatórios.
 *
 * @constructor Cria uma instância de [ReportTypePercentage] com os dados agregados.
 */
data class ReportTypePercentage(
    val type: Int,
    val count: Int,
    val percentage: Double,
)
