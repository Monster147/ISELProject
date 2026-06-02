package pt.ira.token

import java.security.MessageDigest
import java.util.Base64

/**
 * Implementação de um codificador de *tokens* utilizando o algoritmo SHA-256.
 *
 * Esta classe é responsável por transformar *tokens* (*strings*) em hashes
 * criptográficos seguros, utilizando o algoritmo SHA-256 e codificação Base64 URL-safe.
 * O hash resultante é incapaz de ser revertido para o *token* original, garantindo
 * a segurança do armazenamento em base de dados.
 *
 * Implementa a interface [TokenEncoder], aderindo ao padrão de injeção de dependências
 * do *framework* Spring.
 *
 * @see TokenEncoder
 * @see TokenValidationInfo
 */

class Sha256TokenEncoder : TokenEncoder {
    /**
     * Cria informação de validação (hash seguro) a partir de um *token* fornecido.
     *
     * @param token Token a ser codificado.
     * @return [TokenValidationInfo] contendo o hash SHA-256 do token.
     */
    override fun createValidationInformation(token: String): TokenValidationInfo = TokenValidationInfo(hash(token))

    /**
     * Realiza o hash de uma *string* utilizando SHA-256 e codificação Base64 URL-safe.
     *
     * @param input String a ser transformada em hash.
     * @return Hash criptográfico codificado em Base64 URL-safe.
     */
    private fun hash(input: String): String {
        val messageDigest = MessageDigest.getInstance("SHA256")
        return Base64.getUrlEncoder().encodeToString(
            messageDigest.digest(
                Charsets.UTF_8.encode(input).array(),
            ),
        )
    }
}
