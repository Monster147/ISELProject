package pt.ira.interfaces

import pt.ira.documents.Documents

/**
 * Repositório de operações sobre documentos.
 */
interface RepositoryDocuments : Repository<Documents> {
    /**
     * Regista a informação de um novo documento.
     *
     * @param name Nome do documento.
     * @param type Tipo do documento (ex: Automóvel, Saúde, etc.).
     * @param filepath Caminho onde o ficheiro do documento está armazenado.
     *
     * @return [Documents] criado com a informação fornecida.
     */
    fun uploadDocumentInfo(
        name: String,
        type: String,
        filepath: String,
    ): Documents

    /**
     * Obtém todos os tipos de documentos existentes.
     *
     * @return Lista de tipos de documentos.
     */
    fun findAllTypes(): List<String>

    /**
     * Obtém um documento pelo seu nome.
     *
     * @param name Nome do documento a procurar.
     *
     * @return [Documents] correspondente, ou null caso não exista.
     */
    fun findByName(name: String): Documents?

    /**
     * Obtém todos os documentos de um determinado tipo.
     *
     * @param type Tipo de documento a filtrar.
     *
     * @return Lista de [Documents] que correspondem ao tipo indicado.
     */
    fun findByType(type: String): List<Documents>
}
