package pt.ira.model.documents

/**
 * Modelo de transferência de dados para o upload de documentos.
 *
 * Encapsula os metadados necessários para a criação de um novo documento no sistema.
 * Este modelo é utilizado como contrato entre o cliente HTTP e o controlador,
 * permitindo que o cliente especifique o nome e a categoria do documento a ser carregado.
 *
 * @property name Nome descritivo do documento (ex: "Declaração de Acidente").
 * @property type Categoria ou domínio temático do documento (ex: "Automovel", "Pessoal").
 *
 * @see Documents
 */
data class DocumentInputModel(
    val name: String,
    val type: String,
)
