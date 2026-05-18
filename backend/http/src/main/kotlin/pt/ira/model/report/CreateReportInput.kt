package pt.ira.model.report

import com.fasterxml.jackson.databind.JsonNode

/**
 * Modelo de transferência de dados para a criação de relatórios.
 *
 * Encapsula os metadados necessários para a criação de um novo relatório associado
 * a uma ocorrência. Este modelo é utilizado como contrato entre o cliente HTTP e o controlador,
 * permitindo que o cliente especifique os elementos essenciais para documentar e formalizar
 * uma ocorrência através de um relatório estruturado.
 *
 * @property creatorId Identificador do utilizador responsável pela criação do relatório.
 * @property occurrenceId Identificador da ocorrência à qual o relatório está associado.
 * @property title Título ou designação do relatório.
 * @property description Descrição detalhada e contextual do conteúdo do relatório.
 * @property addons Informação adicional em formato JSON, permitindo extensões específicas
 *                  ao domínio ou metainformação complementar conforme necessário.
 *
 * @see Report
 */
data class CreateReportInput(
    val creatorId: Int,
    val occurrenceId: Int,
    val title: String,
    val description: String,
    val addons: JsonNode,
)
