package pt.ira.type

/**
 * Resultado da criação de um tipo de ocorrência.
 *
 * Agrega o tipo recém-criado e a lista atualizada de todos os tipos no sistema,
 * permitindo notificar o utilizador com ambos os dados numa única operação.
 *
 * @property type Tipo de ocorrência criado.
 * @property allTypes Lista atualizada de todos os tipos existentes.
 *
 * @see Type
 */
data class CreatedTypeResult(
    val type: Type,
    val allTypes: List<Type>,
)
