/**
 * Estado de um relatório no seu ciclo de vida.
 * - EDITING: Em edição, ainda não submetido.
 * - SUBMITTED: Submetido para aprovação.
 * - APPROVED: Aprovado por um responsável.
 * - REJECTED: Rejeitado, requerendo revisão.
 */
export enum ReportStatus {
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  EDITING = "EDITING",
}
