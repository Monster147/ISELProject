package pt.ira.statistics

/**
 * Representa um resumo de estatísticas gerais do sistema.
 *
 * Este modelo encapsula as métricas relativas à utilização
 * e à atividade da plataforma, permitindo uma visão rápida do estado global
 * quanto ao volume de utilizadores, ocorrências, relatórios e evidências registadas.
 *
 * @property totalUsers Número total de utilizadores registados no sistema.
 * @property totalOccurrences Número total de ocorrências criadas no sistema.
 * @property totalReports Número total de relatórios produzidos no sistema.
 * @property totalEvidences Número total de evidências recolhidas no sistema.
 *
 * @constructor Cria uma instância de [OverviewStats] com as agregações
 *              necessárias para fornecer uma visão panorâmica do sistema.
 */

data class OverviewStats(
    val totalUsers: Int,
    val totalOccurrences: Int,
    val totalReports: Int,
    val totalEvidences: Int,
)
