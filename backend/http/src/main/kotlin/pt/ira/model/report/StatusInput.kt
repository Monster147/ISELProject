package pt.ira.model.report

/**
 * Modelo de transferência de dados para alteração de estado de um relatório.
 *
 * Encapsula o novo estado a ser aplicado a um relatório.
 * Este modelo é utilizado como contrato entre o cliente HTTP e o controlador,
 * permitindo a transição de estado do relatório.
 *
 * @property newStatus O novo estado do relatório no workflow (ex: "EDITING", "SUBMITTED", "APPROVED").
 *
 * @see Report
 * @see ReportStatus
 */
data class StatusInput(
    val newStatus: String,
)
