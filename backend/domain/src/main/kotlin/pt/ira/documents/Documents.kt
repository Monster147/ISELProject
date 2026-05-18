package pt.ira.documents

/**
 * Representa um documento de apoio.
 *
 * Um documento é um recurso informativo disponibilizado aos averiguadores,
 * organizado por categorias (como automóvel, saúde ou legislação de referência).
 * Armazena os metadados necessários para a sua catalogação, localização e acesso.
 *
 * @property id Identificador único do documento.
 * @property name Nome descritivo do documento (ex: "Declaração de Acidente", "Código da Estrada").
 * @property type Categoria do documento (ex: "Automovel", "Pessoal", "Legislacao").
 * @property filepath Caminho ou localização do ficheiro no sistema de armazenamento.
 *
 * @constructor Cria uma instância de [Documents] com os metadados necessários
 *              para servir o documento aos averiguadores.
 */

data class Documents(
    val id: Int,
    val name: String,
    val type: String,
    val filepath: String,
)
