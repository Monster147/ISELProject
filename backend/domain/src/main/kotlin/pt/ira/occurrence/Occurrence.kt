package pt.ira.occurrence

import com.fasterxml.jackson.databind.JsonNode
import java.time.LocalDate

/**
 * Representa uma ocorrência registada no sistema.
 *
 * Uma ocorrência contém informações temporais, classificação de importância,
 * dados estruturados em formato JSON e referências para a entidades relacionadas,
 * como intervenientes e evidências.
 *
 * @property id Identificador único da ocorrência.
 * @property initDate Data de início da ocorrência.
 * @property endDate Data de entrega do relatório da ocorrência.
 * @property reporterId Identificador do utilizador que reportou a ocorrência.
 * @property importance Nível de importância da ocorrência, usado para priorização.
 *                      Por defeito é [OccurrenceType.NORMAL].
 * @property occurrenceType Tipo da ocorrência, representado por um inteiro que pode ser mapeado para categorias específicas.
 * @property occurrenceInfo Informação adicional da ocorrência em formato JSON,
 *                          podendo incluir detalhes específicos dependentes do tipo.
 * @property intervenors Lista de identificadores dos intervenientes associados à ocorrência.
 * @property evidences Lista de identificadores das evidências associadas à ocorrência.
 *
 * @constructor Cria uma instância de [Occurrence] com os dados fornecidos.
 */
data class Occurrence(
    val id: Int,
    val initDate: LocalDate,
    val endDate: LocalDate,
    val reporterId: Int,
    val importance: OccurrenceType = OccurrenceType.NORMAL,
    val occurrenceType: Int,
    val occurrenceInfo: JsonNode,
    val intervenors: List<Int> = listOf(),
    val evidences: List<Int> = listOf(),
)
