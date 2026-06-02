package pt.ira.interfaces

import pt.ira.intervenor.Intervenor

/**
 * Repositório de operações sobre intervenientes.
 */
interface RepositoryIntervenor : Repository<Intervenor> {
    /**
     * Cria um interveniente com os dados fornecidos.
     *
     * @param idNumber Número de identificação do interveniente.
     * @param idType Tipo de identificação (ex: CC, NIF, Passaporte).
     * @param name Nome do interveniente ou entidade.
     * @param contactInfo Informação de contacto.
     * @param address Morada do interveniente.
     *
     * @return [Intervenor] criado.
     */
    fun createIntervenor(
        idNumber: String,
        idType: String,
        name: String,
        contactInfo: String,
        address: String,
    ): Intervenor

    /**
     * Atualiza um interveniente existente.
     *
     * Apenas os parâmetros não nulos são atualizados.
     *
     * @param intervenor Instância actual do interveniente a atualizar.
     * @param idNumber Novo número de identificação (opcional).
     * @param idType Novo tipo de identificação (opcional).
     * @param name Novo nome (opcional).
     * @param contactInfo Nova informação de contacto (opcional).
     * @param address Nova morada (opcional).
     *
     * @return [Intervenor] atualizado.
     */
    fun updateIntervenor(
        intervenor: Intervenor,
        idNumber: String?,
        idType: String?,
        name: String?,
        contactInfo: String?,
        address: String?,
    ): Intervenor

    /**
     * Obtém um interveniente pelo número de identificação.
     *
     * @param idNumber Número de identificação a procurar.
     *
     * @return [Intervenor] correspondente, ou null caso não exista.
     */
    fun findByIdNumber(idNumber: String): Intervenor?

    /**
     * Obtém um interveniente pela informação de contacto.
     *
     * @param contactInfo Informação de contacto a procurar.
     *
     * @return [Intervenor] correspondente, ou null caso não exista.
     */
    fun findByContactInfo(contactInfo: String): Intervenor?
}
