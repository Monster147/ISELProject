package pt.ira.model.intervenor

/**
 * Modelo de transferência de dados para a atualização parcial de intervenientes.
 *
 * Encapsula os metadados opcionais para a atualização de um interveniente existente.
 * Ao contrário de [IntervenorInput], todos os campos são nullable, permitindo que apenas
 * os campos que se pretendem alterar sejam fornecidos pelo cliente.
 * Este modelo é utilizado como contrato entre o cliente HTTP e o controlador,
 * facilitando atualizações seletivas sem necessidade de fornecer a totalidade dos dados.
 *
 * @property idNumber Novo número de identificação (opcional).
 * @property idType Novo tipo de identificação (opcional).
 * @property name Novo nome completo ou designação (opcional).
 * @property contactInfo Novos dados de contacto (opcional).
 * @property address Nova morada ou localização (opcional).
 *
 * @see Intervenor
 * @see IntervenorInput
 */
data class IntervenorUpdateInput(
    val idNumber: String?,
    val idType: String?,
    val name: String?,
    val contactInfo: String?,
    val address: String?,
)
