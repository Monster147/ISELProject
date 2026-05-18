package pt.ira.storage

import org.springframework.core.io.Resource
import org.springframework.web.multipart.MultipartFile

/**
 * Define o contrato para operações de armazenamento de ficheiros no sistema.
 *
 * Esta interface abstrai a gestão física de ficheiros, permitindo que evidências
 * (associadas a ocorrências) e documentos de apoio sejam armazenados e recuperados
 * de forma uniforme, independentemente da implementação subjacente (sistema de ficheiros,
 * armazenamento na cloud).
 *
 * @see Resource
 */
interface StorageService {
    /**
     * Armazena uma evidência associada a uma ocorrência específica.
     *
     * @param occurrenceId Identificador da ocorrência à qual a evidência está associada.
     * @param file Ficheiro a ser armazenado.
     * @return Caminho ou localização relativa onde o ficheiro foi armazenado.
     */
    fun save(
        occurrenceId: Int,
        file: MultipartFile,
    ): String

    /**
     * Armazena um documento de apoio.
     *
     * Guarda um documento geral do sistema com metadados
     * de identificação e categorização.
     *
     * @param file Ficheiro a ser armazenado.
     * @param documentName Nome descritivo do documento.
     * @param documentType Categoria ou tipo do documento (ex: "Automovel", "Pessoal").
     * @return Caminho ou localização relativa onde o ficheiro foi armazenado.
     */
    fun saveDocument(
        file: MultipartFile,
        documentName: String,
        documentType: String,
    ): String

    /**
     * Carrega um ficheiro de evidência a partir do armazenamento.
     *
     * @param path Caminho relativo do ficheiro a recuperar.
     * @return [Resource] representando o ficheiro, ou null se não existir.
     */
    fun loadEvidence(path: String): Resource?

    /**
     * Carrega um documento de apoio a partir do armazenamento.
     *
     * @param path Caminho relativo do ficheiro a recuperar.
     * @return [Resource] representando o ficheiro, ou null se não existir.
     */
    fun loadDocument(path: String): Resource?

    /**
     * Elimina uma evidência do armazenamento.
     *
     * @param path Caminho relativo do ficheiro a deletar.
     * @return true se a eliminação foi bem-sucedida, false caso contrário.
     */
    fun deleteEvidence(path: String): Boolean

    /**
     * Elimina todas as evidências associadas a uma ocorrência específica.
     *
     * @param occurrenceId Identificador da ocorrência cujas evidências serão deletadas.
     * @return true se todas as eliminações foram bem-sucedidas, false caso contrário.
     */
    fun deleteOccurrenceEvidences(occurrenceId: Int): Boolean

    /**
     * Elimina um documento de apoio do armazenamento.
     *
     * @param path Caminho relativo do ficheiro a deletar.
     * @return true se a eliminação foi bem-sucedida, false caso contrário.
     */
    fun deleteDocument(path: String): Boolean
}
