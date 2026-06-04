package pt.ira.interfaces

import com.fasterxml.jackson.databind.JsonNode
import pt.ira.report.Report
import pt.ira.report.ReportStatus
import pt.ira.user.User

/**
 * Repositório de operações sobre relatórios.
 */
interface RepositoryReport : Repository<Report> {
    /**
     * Cria um relatório com os dados fornecidos.
     *
     * @param creatorId Identificador do utilizador que criou o relatório.
     * @param occurrenceId Identificador da ocorrência associada ao relatório.
     * @param title Título do relatório.
     * @param description Descrição detalhada do relatório.
     * @param type Tipo do relatório em formato JSON.
     * @param addons Dados adicionais do relatório em formato JSON.
     * @param intervenors Lista de identificadores dos intervenientes associados ao relatório.
     *
     * @return [Report] criado.
     */
    fun createReport(
        creatorId: Int,
        occurrenceId: Int,
        title: String,
        description: String,
        type: Int,
        addons: JsonNode,
        intervenors: List<Int>,
        language: String,
    ): Report

    /**
     * Obtém um relatório associado a uma determinada ocorrência.
     *
     * @param occurrenceId Identificador da ocorrência.
     *
     * @return [Report] correspondente, ou null caso não exista.
     */
    fun findByOccurrenceId(occurrenceId: Int): Report?

    /**
     * Obtém todos os relatórios com um determinado estado.
     *
     * @param status Estado do relatório.
     *
     * @return Lista de [Report] com o estado indicado.
     */
    fun findByStatus(status: ReportStatus): List<Report>

    /**
     * Obtém todos os relatórios criados por um determinado utilizador.
     *
     * @param creatorId Identificador do criador.
     *
     * @return Lista de [Report] associados ao utilizador.
     */
    fun findByCreatorId(creatorId: Int): List<Report>

    /**
     * Obtém todos os relatórios em que um utilizador é editor.
     *
     * @param userId Identificador do utilizador.
     *
     * @return Lista de [Report] onde o utilizador é editor.
     */
    fun findByEditor(userId: Int): List<Report>

    /**
     * Adiciona um editor a um relatório.
     *
     * @param report Relatório ao qual o editor será adicionado.
     * @param user Utilizador a adicionar como editor.
     *
     * @return [Report] atualizado com o novo editor.
     */
    fun addEditor(
        report: Report,
        user: User,
    ): Report

    /**
     * Remove um editor de um relatório.
     *
     * @param report Relatório do qual o editor será removido.
     * @param user Utilizador a remover da lista de editores.
     *
     * @return [Report] atualizado sem o editor indicado.
     */
    fun removeEditor(
        report: Report,
        user: User,
    ): Report

    /**
     * Atualiza o estado de um relatório.
     *
     * @param report Relatório a atualizar.
     * @param status Novo estado do relatório.
     *
     * @return [Report] com o estado atualizado.
     */
    fun updateStatus(
        report: Report,
        status: ReportStatus,
    ): Report

    /**
     * Obtém todos os relatórios de um determinado tipo.
     *
     * @param type Tipo do relatório representado por um inteiro.
     *
     * @return Lista de [Report] que correspondem ao tipo indicado.
     */
    fun findByType(type: Int): List<Report>
}
