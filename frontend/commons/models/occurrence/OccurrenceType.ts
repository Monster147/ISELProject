/**
 * Nível de importância de uma ocorrência.
 * - NORMAL: Baixa prioridade, sem urgência.
 * - URGENT: Requer atenção rápida.
 * - CRITICAL: Máxima prioridade, requer resposta imediata.
 */
export enum OccurrenceType {
  NORMAL = "NORMAL",
  URGENT = "URGENT",
  CRITICAL = "CRITICAL",
}
