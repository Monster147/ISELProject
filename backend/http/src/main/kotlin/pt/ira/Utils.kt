package pt.ira

import org.springframework.http.MediaType
import java.nio.file.Path

/**
 * Resolve o tipo de conteúdo Media Type apropriado com base na extensão do ficheiro.
 *
 * Função utilitária que examina a extensão de um ficheiro e retorna o correspondente
 * Media Type HTTP. É utilizada principalmente no contexto de downloads de ficheiros,
 * garantindo que o cliente recebe a informação correta sobre o tipo de conteúdo sendo transmitido.
 *
 * Suporta um conjunto de extensões comuns (PDF, imagens, texto, JSON), retornando
 * [MediaType.APPLICATION_OCTET_STREAM] como fallback para tipos desconhecidos.
 *
 * @param filePath Caminho do ficheiro cuja extensão será analisada.
 * @return [MediaType] correspondente à extensão detectada, ou [MediaType.APPLICATION_OCTET_STREAM]
 *         se a extensão não for reconhecida.
 * @see MediaType
 */

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
