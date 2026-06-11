package pt.ira.pdfGeneration

import com.fasterxml.jackson.databind.JsonNode
import org.apache.pdfbox.Loader
import org.apache.pdfbox.pdmodel.PDDocument
import org.apache.pdfbox.pdmodel.PDPage
import org.apache.pdfbox.pdmodel.PDPageContentStream
import org.apache.pdfbox.pdmodel.common.PDRectangle
import org.apache.pdfbox.pdmodel.font.PDType1Font
import org.apache.pdfbox.pdmodel.font.Standard14Fonts
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject
import org.apache.pdfbox.rendering.PDFRenderer
import org.springframework.core.io.Resource
import pt.ira.storage.StorageService
import java.io.ByteArrayOutputStream
import javax.imageio.ImageIO

class PDBuilder(
    private val doc: PDDocument,
    private val language: String,
    private val pdfText: PDFText,
    private val storageService: StorageService
) {
    private val margin = 50f
    private val lineHeight = 14f
    private var page = PDPage(PDRectangle.A4).also { doc.addPage(it) }
    private var content = PDPageContentStream(doc, page)
    var y = page.mediaBox.height - margin

    fun close() = content.close()

    fun newPage() {
        content.beginText()
        content.endText()
        content.close()
        page = PDPage(PDRectangle.A4).also { doc.addPage(it) }
        content = PDPageContentStream(doc, page)
        y = page.mediaBox.height - margin
    }

    private inline fun drawWithStroke(
        lineWidth: Float = 1f,
        greenAndLine: Boolean = true,
        block: PDPageContentStream.() -> Unit
    ) {
        content.saveGraphicsState()
        if (greenAndLine) {
            content.setStrokingColor(4f / 255f, 58f / 255f, 35f / 255f)
            content.setLineWidth(lineWidth)
            content.block()
            content.stroke()
        } else {
            content.block()
        }
        content.restoreGraphicsState()
    }

    fun drawLine() {
        drawWithStroke {
            moveTo(margin, y)
            lineTo(page.mediaBox.width - margin, y)
        }
    }

    fun drawEvidenceBox(
        x: Float,
        width: Float,
        height: Float,
    ) {
        drawWithStroke {
            content.addRect(x-10f, y - height-20f, width+20f, height+20f)
        }
    }

    fun writeLine(
        text: String,
        isTitle: Boolean = false,
    ) {
        val font =
            if (isTitle) {
                PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD)
            } else {
                PDType1Font(Standard14Fonts.FontName.HELVETICA)
            }
        val fontSize = if (isTitle) 16f else 12f
        val maxWidth = page.mediaBox.width - (margin*2)
        val words = text.split(" ")
        val lines = mutableListOf<String>()
        var currLine = ""

        for (word in words) {
            val testLine = if (currLine.isEmpty()) word else "$currLine $word"
            val textWidth = font.getStringWidth(testLine) / 1000 * fontSize
            if (textWidth > maxWidth) {
                lines.add(currLine)
                currLine = word
            } else {
                currLine = testLine
            }
        }
        if (currLine.isNotEmpty()) lines.add(currLine)

        for (line in lines) {
            if (y < margin) newPage()
            content.beginText()
            content.setFont(font, fontSize)
            content.newLineAtOffset(margin, y)
            content.showText(line)
            content.endText()
            y -= lineHeight
        }

    }

    fun renderImage(
        resource: Resource,
        fileName: String,
    ) {
        val imageBytes = resource.inputStream.use{ it.readBytes() }
        val image = PDImageXObject.createFromByteArray(doc, imageBytes, fileName)
        val maxWidth = page.mediaBox.width - (margin * 2) - 20f
        val maxHeight = 250f
        placeImageOnPage(image, maxWidth, maxHeight)
        pdfText.evidenceReference(fileName, language).let { writeLine(it) }
    }

    fun renderPDFPreview(
        resource: Resource,
        fileName: String,
    ) {
        val pdfBytes = resource.inputStream.use{ it.readBytes() }
        Loader.loadPDF(pdfBytes).use { pdf ->
            val renderer = PDFRenderer(pdf)
            val pageImage = renderer.renderImageWithDPI(0, 150f)
            val pageImageByteArray = ByteArrayOutputStream()
            ImageIO.write(pageImage, "png", pageImageByteArray)
            val image = PDImageXObject.createFromByteArray(
                doc, pageImageByteArray.toByteArray(), fileName
            )
            val maxWidth = page.mediaBox.width - (margin * 2) - 20f
            val maxHeight = page.mediaBox.height * 0.7f
            placeImageOnPage(image, maxWidth, maxHeight)
            pdfText.evidenceReference(fileName, language).let { writeLine(it) }
        }
    }

    private fun placeImageOnPage(image: PDImageXObject, width: Float, height: Float) {
        val ratio = minOf(width / image.width, height / image.height)
        val width = image.width * ratio
        val height = image.height * ratio
        val boxHeight = height + 40f
        if (y - boxHeight < margin) newPage()
        val x = margin + ((page.mediaBox.width - (margin * 2) - width) / 2)
        drawEvidenceBox(x, width, height)
        content.drawImage(image, x, y - height - 10f, width, height)
        y -= boxHeight
    }

    fun renderSection(
        title: String,
        sectionData: JsonNode,
        fieldLabelMap: Map<String, String>,
    ) {
        y -= 12
        writeLine(makeTitle(title), true)
        y -= 8
        val data = sectionData["data"] ?: return
        data.properties()?.forEach {
            val fieldName = it.key
            val label = getLabel(fieldName, fieldLabelMap)
            val value = it.value?.takeIf { v -> v.asText() != "null" }?.asText()
            if (value == null) {
                val notAvailable = pdfText.notProvided(language)
                writeLine("$label: $notAvailable")
            } else {
                writeLine("$label: $value")
            }
        }
        renderSectionFiles(sectionData, fieldLabelMap)
        y -= 10
        drawLine()
        y -= 15
    }

    private fun makeTitle(title: String?): String {
        if (title == null) return ""
        val exceptions =
            listOf(
                "de",
                "da",
                "do",
                "das",
                "dos",
                "e",
            )

        return title.lowercase()
            .split(" ")
            .mapIndexed { index, string ->
                if (index > 0 && string in exceptions) {
                    string
                } else {
                    string.replaceFirstChar { it.titlecase() }
                }
            }.joinToString(" ")
    }

    fun renderSectionFiles(
        sectionData: JsonNode,
        fieldLabelMap: Map<String, String>,
    ){
        val files = sectionData["files"] ?: return

        if (!files.isArray || files.isEmpty) {
            return
        }
        files.forEach { file ->
            val fieldName = file["field"]?.asText() ?: return@forEach
            val filePath = file["filePath"].asText() ?: return@forEach
            val resource = storageService.loadEvidence(filePath) ?: return@forEach
            val label = getLabel(fieldName, fieldLabelMap)
            writeLine("$label:")
            val fileName = filePath.substringAfterLast("/")
            when {
                filePath.endsWith(".jpg", true) ||
                        filePath.endsWith(".png", true) ||
                        filePath.endsWith(".jpeg", true) -> renderImage(resource, fileName)
                filePath.endsWith(".pdf", true) -> renderPDFPreview(resource, fileName)
                else -> pdfText.evidenceReference(fileName, language).let { writeLine(it) }
            }
        }
        y -= 10
    }

    private fun getLabel(
        fieldName: String,
        fieldLabelMap: Map<String, String>
    ): String {
        val normalizedField =
            fieldName.replace(
                Regex("_\\d+$"),
                "_{index}"
            )

        val label =
            fieldLabelMap[normalizedField]
                ?: fieldLabelMap[fieldName]
                ?: fieldName

        return label
    }

    fun writeTitle(
        occurrenceId: Int
    ) {
        val logoImage = loadLogoImage("/images/logo.png", "logo.png")
        val logoWidth = 80f
        val spacing = 8f
        val logoHeight =
            if (logoImage != null) {
                logoWidth * logoImage.height.toFloat() / logoImage.width.toFloat()
            } else {
                0f
            }

        val logoX = margin
        val logoY = y - logoHeight

        if (logoImage != null) {
            content.saveGraphicsState()
            content.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight)
            content.restoreGraphicsState()
        }

        val textX = logoX + logoWidth + spacing
        val textStartY = y - 18f
        content.beginText()
        val font = PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD)
        content.setFont(font, 16f)
        content.newLineAtOffset(textX, textStartY)
        content.showText(pdfText.reportTitle(occurrenceId, language).take(120))
        content.endText()

        drawWithStroke(greenAndLine = false) {
            content.beginText()
            content.setNonStrokingColor(211f / 255f, 211f / 255f, 211f / 255f)
            content.setFont(PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 10f)
            content.newLineAtOffset(textX, y - 38f)
            content.showText(pdfText.generationDate(language).take(120))
            content.endText()
        }

        val headerHeight = maxOf(logoHeight, 40f) + 20f
        y -= headerHeight
        drawLine()
        y -= 15f
    }

    private fun loadLogoImage(
        path: String,
        name: String?,
    ): PDImageXObject? {
        return try {
            val stream = javaClass.getResourceAsStream(path)
            if (stream != null) {
                val bytes = stream.readBytes()
                PDImageXObject.createFromByteArray(doc, bytes, name)
            } else {
                null
            }
        } catch (e: Exception) {
            null
        }
    }
}