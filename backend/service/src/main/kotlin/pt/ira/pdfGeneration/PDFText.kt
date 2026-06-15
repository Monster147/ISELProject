package pt.ira.pdfGeneration

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

object PDFText {
    fun reportTitle(
        occurrenceId: Int,
        language: String,
    ): String =
        when (language) {
            "pt" -> "Relatório da Ocorrência $occurrenceId"
            "es" -> "Informe de Incidencia $occurrenceId"
            else -> "Occurrence $occurrenceId Report"
        }

    fun generationDate(language: String): String {
        val formatter =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")

        val date =
            LocalDateTime.now().format(formatter)

        return when (language) {
            "pt" -> "Data de geração: $date"
            "es" -> "Fecha de generación: $date"
            else -> "Generation date: $date"
        }
    }

    fun notProvided(language: String): String =
        when (language) {
            "pt" -> "Não disponibilizado"
            "es" -> "No proporcionado"
            else -> "Not provided"
        }

    fun evidenceReference(
        fileName: String,
        language: String,
    ): String =
        when (language) {
            "pt" -> "Consulte o ficheiro de evidência associado para mais detalhes. Nome do ficheiro: $fileName"
            "es" -> "Consulte el archivo de evidencia asociado para más detalles. Nombre del archivo: $fileName"
            else -> "Please refer to the attached evidence file for more details. File name: $fileName"
        }
}
