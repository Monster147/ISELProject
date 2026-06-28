import { ReportStatus } from "../report/ReportStatus";

/**
 * Distribuição de relatórios por estado.
 * @property status Estado do relatório.
 * @property count Número de relatórios.
 * @property percentage Percentagem face ao total.
 */
export interface StatsReportStatus {
  status: ReportStatus;
  count: number;
  percentage: number;
}
