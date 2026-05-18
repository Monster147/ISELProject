package pt.ira.model.intervenor

/**
 * Modelo de transferência de dados para a criação e atualização de intervenientes.
 *
 * Encapsula os metadados necessários para registar um novo interveniente no sistema.
 * Este modelo é utilizado como contrato entre o cliente HTTP e o controlador,
 * permitindo que o cliente especifique todos os elementos identificativos e de contacto
 * de uma pessoa ou entidade envolvida numa ocorrência.
 *
 * @property idNumber Número de identificação do interveniente.
 * @property idType Tipo de identificação.
 * @property name Nome completo do interveniente.
 * @property contactInfo Informação de contacto telefónico.
 * @property address Morada associada ao interveniente.
 *
 * @see Intervenor
 */
data class IntervenorInput(
    val idNumber: String,
    val idType: String,
    val name: String,
    val contactInfo: String,
    val address: String,
)
