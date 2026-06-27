package pt.ira.intervenor

/**
 * Resultado da criação de um interveniente.
 *
 * Agrega o interveniente recém-criado e a lista atualizada de todos os intervenientes
 * no sistema, permitindo notificar o utilizador com ambos os dados numa única operação.
 *
 * @property intervenor Interveniente criado.
 * @property intervenors Lista atualizada de todos os intervenientes existentes.
 *
 * @see Intervenor
 */
data class IntervenorCreatedResult(
    val intervenor: Intervenor,
    val intervenors: List<Intervenor>,
)
