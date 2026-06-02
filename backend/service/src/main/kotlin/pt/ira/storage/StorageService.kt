package pt.ira.storage

import org.apache.pdfbox.pdmodel.PDDocument
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
     * Armazena uma evidência no sistema de ficheiros, organizando-a sob a ocorrência específica.
     *
     * @param occurrenceId Identificador da ocorrência à qual a evidência está associada.
     * @param file Ficheiro da evidência a ser armazenado.
     * @return Caminho relativo onde o ficheiro foi guardado.
     */
    fun save(
        occurrenceId: Int,
        file: MultipartFile,
    ): String

    /**
     * Armazena um documento de apoio no sistema de ficheiros, organizando-o por categoria.
     *
     * Documentos são guardados em diretórios segregados pela sua categoria (ex: "Automovel", "Pessoal").
     *
     * @param file Ficheiro do documento a ser armazenado.
     * @param documentName Nome descritivo do documento (será utilizado como nome do ficheiro base).
     * @param documentType Categoria do documento (cria subdiretório correspondente).
     * @return Caminho relativo onde o ficheiro foi guardado, ou string vazia se o ficheiro já existe.
     */
    fun saveDocument(
        file: MultipartFile,
        documentName: String,
        documentType: String,
    ): String

    /**
     * Armazena um relatório no sistema de ficheiros.
     *
     * @param fileName Nome do ficheiro.
     * @param document Documento PDF a ser armazenado.
     * @return Caminho ou localização relativa onde o ficheiro foi armazenado.
     */
    fun saveReport(
        fileName: String,
        document: PDDocument,
    ): String

    /**
     * Carrega um ficheiro de evidência a partir do sistema de ficheiros.
     *
     * @param path Caminho relativo do ficheiro a carregar.
     * @return [Resource] representando o ficheiro, ou null se não existir.
     */
    fun loadEvidence(path: String): Resource?

    /**
     * Carrega um documento de apoio a partir do sistema de ficheiros.
     *
     * @param path Caminho relativo do ficheiro a carregar.
     * @return [Resource] representando o ficheiro, ou null se não existir.
     */
    fun loadDocument(path: String): Resource?

    /**
     * Elimina uma evidência do sistema de ficheiros.
     *
     * @param path Caminho relativo do ficheiro a eliminar.
     * @return true se a eliminação foi bem-sucedida, false caso contrário.
     */
    fun deleteEvidence(path: String): Boolean

    /**
     * Elimina todas as evidências associadas a uma ocorrência específica.
     *
     * @param occurrenceId Identificador da ocorrência cujas evidências serão eliminadas.
     * @return true se todas as eliminações foram bem-sucedidas, false caso contrário.
     */
    fun deleteOccurrenceEvidences(occurrenceId: Int): Boolean

    /**
     * Elimina um documento de apoio do sistema de ficheiros.
     *
     * @param path Caminho relativo do ficheiro a eliminar.
     * @return true se a eliminação foi bem-sucedida, false caso contrário.
     */
    fun deleteDocument(path: String): Boolean

    /**
     * Atualiza um ficheiro de evidência existente, reescrevendo-o completamente.
     *
     * @param path Caminho relativo do ficheiro a reescrever.
     * @param file Novo ficheiro com conteúdo atualizado.
     * @return true se a atualização foi bem-sucedida, false caso contrário.
     */
    fun updateEvidence(path: String, file: MultipartFile): Boolean
}
