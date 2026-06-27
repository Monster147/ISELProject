package pt.ira.evidence

/**
 * Representa uma evidência associada a uma ocorrência.
 *
 * Cada evidência contém metadados descritivos, informação da localização,
 * referência ao ficheiro armazenado e ligações às entidades relacionadas
 * (ocorrência e utilizador que reportou)
 *
 * @property id Identificador único da evidência.
 * @property type Tipo da evidência.
 * @property filePath Caminho para o ficheiro associado à evidência no sistema de armazenamento.
 * @property location Local onde a evidência foi recolhida ou observada.
 * @property description Descrição textual detalhada da evidência.
 * @property occurrenceId Identificador da ocorrência à qual esta evidência está associada.
 * @property reporterId Identificador do utilizador que reportou a evidência.
 * @property createdAt Timestamp (epoch millis) que indica quando a evidência foi criada.
 * @property updatedAt Timestamp (epoch millis) que indica a última atualização da evidência.
 *
 * @constructor Cria uma instância de [Evidence] com timestamps automáticos por defeito
 *              para criação e atualização
 */
data class Evidence(
    val id: Int,
    val type: String,
    val filePath: String,
    val location: String,
    val description: String,
    val occurrenceId: Int,
    val reporterId: Int,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
)
