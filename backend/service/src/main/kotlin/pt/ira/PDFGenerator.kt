package pt.ira

import org.apache.pdfbox.pdmodel.PDDocument
import org.springframework.stereotype.Component
import pt.ira.pdfGeneration.PDBuilder
import pt.ira.pdfGeneration.PDFText
import pt.ira.storage.StorageService

/**
 * Componente responsável pela criação de builders de documentos PDF.
 *
 * Atua como fábrica de instâncias de [PDBuilder], injetando as dependências
 * necessárias para a construção de documentos PDF, incluindo o serviço de armazenamento
 * e os textos localizados.
 *
 * @param storageService Serviço de armazenamento de ficheiros, usado pelo [PDBuilder]
 *                       para carregar recursos (imagens, evidências) durante a geração do PDF.
 *
 * @see PDBuilder
 * @see PDFText
 */
@Component
class PDFGenerator(
    private val storageService: StorageService,
) {
    /**
     * Cria um [PDBuilder] configurado para um documento e linguagem específicos.
     *
     * @param doc Documento PDF em construção.
     * @param language Identificação internacional utilizada nos textos gerados (ex: "pt", "es", "en").
     * @return Instância de [PDBuilder] pronta a ser utilizada para construção do PDF.
     */
    fun createPDFBuilder(
        doc: PDDocument,
        language: String,
    ): PDBuilder {
        return PDBuilder(doc, language, PDFText, storageService)
    }
}
