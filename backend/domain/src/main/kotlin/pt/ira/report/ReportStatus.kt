package pt.ira.report

/**
 * Define os possíveis estados de um relatório no seu ciclo de vida.
 *
 * Estes estados representam o workflow desde a edição até à decisão final.
 *
 * - [EDITING]: Relatório em fase de edição, ainda não submetido.
 * - [SUBMITTED]: Relatório submetido para revisão.
 * - [APPROVED]: Relatório aprovado após revisão.
 * - [REJECTED]: Relatório rejeitado após revisão.
 */
enum class ReportStatus {
    SUBMITTED,
    APPROVED,
    REJECTED,
    EDITING,
}
