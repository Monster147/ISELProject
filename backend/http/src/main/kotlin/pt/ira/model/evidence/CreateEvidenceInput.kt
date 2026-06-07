package pt.ira.model.evidence

/**
 * Modelo de transferência de dados para a criação de evidências.
 *
 * Encapsula os metadados necessários para a criação de uma nova evidência associada
 * a uma ocorrência. Este modelo é utilizado como contrato entre o cliente HTTP e o controlador,
 * permitindo que o cliente especifique todos os elementos obrigatórios para registar uma evidência.
 *
 * @property type Tipo da evidência.
 * @property location Local onde a evidência foi recolhida ou observada.
 * @property description Descrição textual detalhada e contextual da evidência.
 * @property reporterId Identificador do utilizador responsável pelo reporte da evidência.
 * @property occurrenceId Identificador da ocorrência à qual esta evidência está associada.
 *
 * @see Evidence
 */
data class CreateEvidenceInput(
    val type: String,
    val location: String,
    val description: String,
    val reporterId: Int,
    val occurrenceId: Int,
)
