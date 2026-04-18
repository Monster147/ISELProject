package pt.ira

import org.springframework.http.MediaType
import java.nio.file.Path

fun resolveContentType(filePath: Path): MediaType {
    val fileName = filePath.fileName.toString()
    val extension = fileName.substringAfterLast('.', "").lowercase()

    return when (extension) {
        "pdf" -> MediaType.APPLICATION_PDF
        "png" -> MediaType.IMAGE_PNG
        "jpg", "jpeg" -> MediaType.IMAGE_JPEG
        "txt" -> MediaType.TEXT_PLAIN
        "json" -> MediaType.APPLICATION_JSON
        "heic", "heif" -> MediaType.parseMediaType("image/heic")
        else -> MediaType.APPLICATION_OCTET_STREAM
    }
}
