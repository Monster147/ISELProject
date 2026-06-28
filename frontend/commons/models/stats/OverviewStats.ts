/**
 * Estatísticas gerais do sistema.
 * @property totalUsers Total de utilizadores.
 * @property totalOccurrences Total de ocorrências.
 * @property totalReports Total de relatórios.
 * @property totalEvidences Total de evidências.
 */
export interface OverviewStats {
  totalUsers: number;
  totalOccurrences: number;
  totalReports: number;
  totalEvidences: number;
}
