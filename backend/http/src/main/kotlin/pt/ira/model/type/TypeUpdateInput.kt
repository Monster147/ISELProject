package pt.ira.model.type

import com.fasterxml.jackson.databind.JsonNode

/**
 * Modelo de transferência de dados para a atualização parcial de tipos.
 *
 * Encapsula os metadados opcionais para a atualização de um tipo existente.
 * Ao contrário de [TypeCreateInput], todos os campos são nullable, permitindo que apenas
 * os campos que se pretendem alterar sejam fornecidos pelo cliente.
 * Este modelo é utilizado como contrato entre o cliente HTTP e o controlador,
 * facilitando atualizações seletivas sem necessidade de fornecer a totalidade dos dados.
 *
 * @property name Novo nome do tipo (opcional).
 * @property form Nova definição da estrutura do formulário em formato JSON (opcional),
 *                permitindo atualização da configuração de campos a recolher.
 *
 * @see Type
 * @see TypeCreateInput
 */
data class TypeUpdateInput(
    val name: String?,
    val form: JsonNode?,
)
