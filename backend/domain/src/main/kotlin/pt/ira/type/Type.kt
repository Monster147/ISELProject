package pt.ira.type

import com.fasterxml.jackson.databind.JsonNode

/**
 * Representa um tipo de ocorrência com o seu formulário de caracterização associado.
 *
 * Um tipo encapsula a definição de uma categoria de ocorrência, incluindo o seu identificador,
 * designação e o esquema de formulário JSON que determina quais os campos a serem preenchidos
 * pelos averiguadores quando recebem uma ocorrência deste tipo específico.
 *
 * @property id Identificador único do tipo de ocorrência.
 * @property name Nome descritivo do tipo (ex: "Acidente Automóvel", "Sinistro Doméstico").
 * @property form Definição do formulário em formato JSON que especifica a estrutura dos dados
 *                a recolher para ocorrências deste tipo.
 *
 * @constructor Cria uma instância de [Type] com a informação necessária para catalogar
 *              e caracterizar ocorrências de um tipo específico.
 */

data class Type(
    val id: Int,
    val name: String,
    val form: JsonNode,
)
