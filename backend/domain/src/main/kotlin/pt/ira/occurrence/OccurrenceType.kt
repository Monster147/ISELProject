package pt.ira.occurrence

/**
 * Define os níveis de importância de uma ocorrência.
 *
 * Estes níveis podem ser utilizados para priorização, alertas e workflows
 * diferenciados no sistema.
 *
 * - [NORMAL]: Ocorrência de prioridade padrão, sem urgência.
 * - [URGENT]: Ocorrência que requer atenção rápida.
 * - [CRITICAL]: Ocorrência crítica que exige intervenção imediata.
 */
enum class OccurrenceType {
    NORMAL,
    URGENT,
    CRITICAL,
}
