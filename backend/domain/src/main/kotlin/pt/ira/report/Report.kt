package pt.ira.report

import com.fasterxml.jackson.databind.JsonNode

/**
 * Representa um relatório associado a uma ocorrência.
 *
 * Um relatório contém informação descritiva, estado no workflow,
 * dados estruturados em formato JSON e relações com utilizadores e intervenientes.
 * Pode ser editado por múltiplos utilizadores antes de ser submetido.
 *
 * @property id Identificador único do relatório.
 * @property creatorId Identificador do utilizador que criou o relatório.
 * @property occurrenceId Identificador da ocorrência à qual o relatório está associado.
 * @property title Título do relatório.
 * @property description Descrição detalhada do conteúdo do relatório.
 * @property status Estado atual do relatório no workflow. Por defeito é [ReportStatus.EDITING].
 * @property type Tipo do relatório, representado por um inteiro que pode ser mapeado para categorias específicas.
 * @property addons Dados adicionais em formato JSON, podendo incluir extensões
 *                  específicas ao domínio ou meta informação.
 * @property createdAt Timestamp (epoch millis) que indica quando o relatório foi criado.
 * @property updatedAt Timestamp (epoch millis) que indica a última atualização do relatório.
 * @property editors Lista de identificadores dos utilizadores com permissões de edição.
 * @property intervenors Lista de identificadores dos intervenientes associados ao relatório.
 *
 * @constructor Cria uma instância de [Report] com os dados fornecidos.
 */
data class Report(
    val id: Int,
    val creatorId: Int,
    val occurrenceId: Int,
    val title: String,
    val description: String,
    val status: ReportStatus = ReportStatus.EDITING,
    val type: Int,
    val addons: JsonNode,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val editors: List<Int> = listOf(),
    val intervenors: List<Int>,
    val language: String,
)
