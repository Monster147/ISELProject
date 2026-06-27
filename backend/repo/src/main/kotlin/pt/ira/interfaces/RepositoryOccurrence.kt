package pt.ira.interfaces

import com.fasterxml.jackson.databind.JsonNode
import pt.ira.evidence.Evidence
import pt.ira.intervenor.Intervenor
import pt.ira.occurrence.Occurrence
import pt.ira.occurrence.OccurrenceType
import java.time.LocalDate

/**
 * Repositório de operações sobre ocorrências.
 */
interface RepositoryOccurrence : Repository<Occurrence> {
    /**
     * Cria uma ocorrência com os dados fornecidos.
     *
     * @param endDate Data de entrega do relatório da ocorrência.
     * @param reporterId Identificador do utilizador que registou a ocorrência.
     * @param importance Nível de importância da ocorrência.
     * @param occurrenceType Tipo da ocorrência em formato JSON.
     * @param occurrenceInfo Informação adicional da ocorrência em formato JSON.
     *
     * @return [Occurrence] criada.
     */
    fun createOccurrence(
        endDate: LocalDate,
        reporterId: Int,
        importance: OccurrenceType,
        occurrenceType: Int,
        occurrenceInfo: JsonNode,
    ): Occurrence

    /**
     * Obtém todas as ocorrências com um determinado nível de importância.
     *
     * @param importance Nível de importância a filtrar.
     *
     * @return Lista de [Occurrence] com a importância indicada.
     */
    fun findByImportance(importance: OccurrenceType): List<Occurrence>

    /**
     * Obtém todas as ocorrências registadas por um determinado utilizador.
     *
     * @param reporterId Identificador do utilizador.
     *
     * @return Lista de [Occurrence] associadas ao utilizador.
     */
    fun findOccurrenceByReporterId(reporterId: Int): List<Occurrence>

    /**
     * Obtém todas as ocorrências associadas a um interveniente.
     *
     * @param intervenor Interveniente a pesquisar.
     *
     * @return Lista de [Occurrence] onde o interveniente participa.
     */
    fun findByIntervenor(intervenor: Intervenor): List<Occurrence>

    /**
     * Adiciona um interveniente a uma ocorrência.
     *
     * @param occurrence Ocorrência à qual o interveniente será adicionado.
     * @param intervenor Interveniente a adicionar.
     *
     * @return [Occurrence] atualizada com o interveniente adicionado.
     */
    fun addIntervenor(
        occurrence: Occurrence,
        intervenor: Intervenor,
    ): Occurrence

    /**
     * Remove um interveniente de uma ocorrência.
     *
     * @param occurrence Ocorrência da qual o interveniente será removido.
     * @param intervenor Interveniente a remover.
     *
     * @return [Occurrence] atualizada sem o interveniente indicado.
     */
    fun removeIntervenor(
        occurrence: Occurrence,
        intervenor: Intervenor,
    ): Occurrence

    /**
     * Adiciona uma evidência a uma ocorrência.
     *
     * @param occurrence Ocorrência à qual a evidência será adicionado.
     * @param evidence Evidência a adicionar.
     *
     * @return [Occurrence] atualizada com a evidência adicionada.
     */
    fun addEvidence(
        occurrence: Occurrence,
        evidence: Evidence,
    ): Occurrence

    /**
     * Remove uma evidência de uma ocorrência.
     *
     * @param occurrence Ocorrência da qual a evidência será removido.
     * @param evidence Evidência a remover.
     *
     * @return [Occurrence] atualizada sem a evidência indicada.
     */
    fun removeEvidence(
        occurrence: Occurrence,
        evidence: Evidence,
    ): Occurrence
}
