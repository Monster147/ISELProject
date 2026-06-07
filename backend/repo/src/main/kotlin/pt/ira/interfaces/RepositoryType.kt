package pt.ira.interfaces

import com.fasterxml.jackson.databind.JsonNode
import pt.ira.type.Type

/**
 * Repositório de operações sobre tipos de ocorrência.
 */
interface RepositoryType : Repository<Type> {
    /**
     * Cria um tipo com a configuração associada.
     *
     * O campo `form` representa a estrutura dinâmica (em JSON) que define
     * os campos esperados para este tipo (ex: formulário a preencher).
     *
     * @param name Nome do tipo.
     * @param form Estrutura do formulário em formato JSON.
     *
     * @return [Type] criado com os dados fornecidos.
     */
    fun createType(
        name: String,
        form: JsonNode,
    ): Type

    /**
     * Obtém um tipo pelo seu nome.
     *
     * @param name Nome do tipo a procurar.
     *
     * @return [Type] correspondente, ou null caso não exista.
     */
    fun findByName(name: String): Type?
}
