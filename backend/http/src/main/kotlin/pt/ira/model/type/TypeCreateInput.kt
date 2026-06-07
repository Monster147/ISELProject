package pt.ira.model.type

import com.fasterxml.jackson.databind.JsonNode

/**
 * Modelo de transferência de dados para a criação de tipos.
 *
 * Encapsula os metadados necessários para a criação de um novo tipo no sistema.
 * Este modelo é utilizado como contrato entre o cliente HTTP e o controlador.
 *
 * @property name Nome do tipo (ex: "Acidente Automóvel", "Sinistro Doméstico").
 * @property form Definição da estrutura do formulário em formato JSON que especifica os campos
 *                a serem recolhidos para ocorrências deste tipo, permitindo validação e apresentação
 *                dinâmica nos clientes.
 *
 * @see Type
 */
data class TypeCreateInput(
    val name: String,
    val form: JsonNode,
)
