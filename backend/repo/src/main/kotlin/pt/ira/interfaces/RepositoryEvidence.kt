package pt.ira.interfaces

import com.fasterxml.jackson.databind.JsonNode
import pt.ira.evindence.Evidence

/**
 * Repositório de operações sobre evidências.
 */
interface RepositoryEvidence : Repository<Evidence> {
    /**
     * Cria uma evidência com os dados fornecidos.
     *
     * @param type Tipo da evidência.
     * @param filePath Caminho para o ficheiro associado à evidência.
     * @param location Local onde a evidência foi recolhida ou observada.
     * @param description Descrição textual da evidência.
     * @param reporterId Identificador do utilizador que reportou a evidência.
     * @param occurrenceId Identificador da ocorrência associada à evidência.
     *
     * @return A [Evidence] criada.
     */
    fun createEvidence(
        type: String,
        filePath: String,
        location: String,
        description: String,
        reporterId: Int,
        occurrenceId: Int,
    ): Evidence

    /**
     * Obtém todas as evidências associadas a uma determinada ocorrência.
     *
     * @param occurrenceId Identificador da ocorrência.
     *
     * @return Lista de [Evidence] associadas à ocorrência.
     */
    fun findByOccurrenceId(occurrenceId: Int): List<Evidence>

    /**
     * Obtém todas as evidências reportadas por um determinado utilizador.
     *
     * @param reporterId Identificador do utilizador.
     *
     * @return Lista de [Evidence] reportadas pelo utilizador.
     */
    fun findByReporterId(reporterId: Int): List<Evidence>

    /**
     * Obtém todas as evidências de um determinado tipo.
     *
     * @param type Tipo da evidência.
     *
     * @return Lista de [Evidence] que correspondem ao tipo indicado.
     */
    fun findByType(type: String): List<Evidence>

    /**
     * Obtém todas as evidências associadas a uma determinada localização.
     *
     * @param location Local a filtrar.
     *
     * @return Lista de [Evidence] registadas nesse local.
     */
    fun findByLocation(location: String): List<Evidence>
}
