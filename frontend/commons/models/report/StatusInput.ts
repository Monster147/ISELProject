/**
 * Input para atualizar o estado de um relatório.
 * @property newStatus Novo estado a aplicar (ex: "APPROVED", "REJECTED").
 */
export interface StatusInput {
  newStatus: string;
}
