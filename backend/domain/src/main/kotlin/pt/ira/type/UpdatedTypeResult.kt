package pt.ira.type

/**
 * Resultado da atualização de um tipo de ocorrência.
 *
 * Agrega o tipo com os dados atualizados e a lista de todos os tipos no sistema,
 * permitindo notificar o utilizador com ambos os dados numa única operação.
 *
 * @property type Tipo de ocorrência com os dados atualizados.
 * @property types Lista atualizada de todos os tipos existentes.
 *
 * @see Type
 */
data class UpdatedTypeResult(
    val type: Type,
    val types: List<Type>,
)
