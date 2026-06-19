import { ReportStatus } from "../report/ReportStatus";

export interface StatsReportStatus {
  status: ReportStatus;
  count: number;
  percentage: number;
}
