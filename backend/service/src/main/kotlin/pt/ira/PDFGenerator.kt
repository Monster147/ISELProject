package pt.ira

import org.apache.pdfbox.pdmodel.PDDocument
import org.springframework.stereotype.Component
import pt.ira.pdfGeneration.PDBuilder
import pt.ira.pdfGeneration.PDFText
import pt.ira.storage.StorageService

@Component
class PDFGenerator(
    private val storageService: StorageService,
) {
    fun createPDFBuilder(
        doc: PDDocument,
        language: String,
    ): PDBuilder {
        return PDBuilder(doc, language, PDFText, storageService)
    }
}
