package pt.ira.intervenor

/**
 * Representa um interveniente.
 *
 * Um interveniente pode ser uma pessoa ou entidade envolvida, sendo identificado
 * por um tipo e número de identificação, além de conter informação de contacto
 * e morada.
 *
 * @property id Identificador único do interveniente.
 * @property idNumber Número de identificação do interveniente (ex: número de documento).
 * @property idType Tipo de identificação (ex: CC, NIF, Passaporte, etc.).
 * @property name Nome completo do interveniente ou designação da entidade.
 * @property contactInfo Informação de contacto (ex: telefone, email).
 * @property address Morada associada ao interveniente.
 *
 * @constructor Cria uma instância de [Intervenor] com os dados fornecidos
 */
data class Intervenor(
    val id: Int,
    val idNumber: String,
    val idType: String,
    val name: String,
    val contactInfo: String,
    val address: String,
)
