package pt.ira.token

/**
 * Define o contrato para a codificação de *tokens* numa representação de validação.
 *
 * As implementações desta *interface* são responsáveis por transformar um *token*
 * numa instância de [TokenValidationInfo], que pode ser utilizada
 * para verificar a integridade do *token* e contém o seu valor codificado (hashed).
 *
 * @see TokenValidationInfo
 */
interface TokenEncoder {
    /**
     * Cria informação de validação para um dado *token*.
     *
     * A estratégia exata de codificação (hashing) depende da implementação concreta.
     *
     * @param token Token a ser transformado.
     * @return [TokenValidationInfo] contendo a representação de validação do *token*.
     */
    fun createValidationInformation(token: String): TokenValidationInfo
}
