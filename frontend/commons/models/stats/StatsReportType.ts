/**
 * Distribuição de relatórios por tipo de ocorrência.
 * @property type Identificador do tipo.
 * @property count Número de relatórios.
 * @property percentage Percentagem face ao total.
 */
export interface StatsReportType {
  type: number;
  count: number;
  percentage: number;
}
