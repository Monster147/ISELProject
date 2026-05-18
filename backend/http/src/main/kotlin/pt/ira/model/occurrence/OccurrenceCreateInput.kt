package pt.ira.model.occurrence

import com.fasterxml.jackson.databind.JsonNode
import pt.ira.occurrence.OccurrenceType
import java.time.LocalDate

/**
 * Modelo de transferência de dados para a criação de ocorrências.
 *
 * Encapsula os metadados necessários para a criação de uma nova ocorrência no sistema.
 * Este modelo é utilizado como contrato entre o cliente HTTP e o controlador,
 * especificando todos os elementos obrigatórios para registar uma ocorrência.
 *
 * @property usersId Identificador do utilizador responsável pelo reporte da ocorrência.
 * @property endDate Data limite associada à ocorrência.
 * @property importance Nível de prioridade da ocorrência.
 * @property occurrenceType Identificador do tipo de ocorrência, determinando a estrutura dos dados adicionais.
 * @property occurrenceInfo Informação estruturada em formato JSON específica ao tipo de ocorrência,
 *                          permitindo flexibilidade na captura de metadados variáveis.
 *
 * @see Occurrence
 * @see OccurrenceType
 */

data class OccurrenceCreateInput(
    val usersId: Int,
    val endDate: LocalDate,
    val importance: OccurrenceType,
    val occurrenceType: Int,
    val occurrenceInfo: JsonNode,
)
