/**
 * Percentagem de relatórios de um tipo específico para um utilizador.
 * @property type Identificador do tipo de relatório.
 * @property count Número de relatórios deste tipo.
 * @property percentage Percentagem face ao total.
 */
export interface ReportTypePercentage {
  type: number;
  count: number;
  percentage: number;
}
