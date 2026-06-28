package pt.ira.pdfGeneration

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

/**
 * Objeto utilitário que fornece textos localizados para a geração de documentos PDF.
 *
 * Centraliza as strings apresentadas nos relatórios PDF, suportando múltiplas
 * linguagens (Português, Espanhol e Inglês). Cada método devolve o texto
 * correspondente à linguagem indicada, com fallback para inglês.
 */
object PDFText {

    /**
     * Obtém o título do relatório na linguagem especificada.
     *
     * @param occurrenceId Identificador da ocorrência.
     * @param language Código da linguagem ("pt", "es" ou "en").
     *
     * @return Título localizado do relatório.
     */
    fun reportTitle(
        occurrenceId: Int,
        language: String,
    ): String =
        when (language) {
            "pt" -> "Relatório da Ocorrência $occurrenceId"
            "es" -> "Informe de Incidencia $occurrenceId"
            else -> "Occurrence $occurrenceId Report"
        }

    /**
     * Obtém a data e hora de geração do relatório formatadas e localizadas.
     *
     * A data é apresentada no formato `dd/MM/yyyy HH:mm:ss`, sendo o texto
     * introdutório adaptado à linguagem indicada.
     *
     * @param language Código da linguagem ("pt", "es" ou "en").
     *
     * @return Texto contendo a data de geração do relatório.
     */
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

    /**
     * Obtém o texto apresentado quando um valor não se encontra disponível.
     *
     * @param language Código da linguagem ("pt", "es" ou "en").
     *
     * @return Texto localizado indicando que a informação não foi disponibilizada.
     */
    fun notProvided(language: String): String =
        when (language) {
            "pt" -> "Não disponibilizado"
            "es" -> "No proporcionado"
            else -> "Not provided"
        }

    /**
     * Obtém o texto de referência para um ficheiro de evidência associado ao relatório.
     *
     * @param fileName Nome do ficheiro de evidência.
     * @param language Código da linguagem ("pt", "es" ou "en").
     *
     * @return Texto localizado contendo a referência ao ficheiro de evidência.
     */
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
