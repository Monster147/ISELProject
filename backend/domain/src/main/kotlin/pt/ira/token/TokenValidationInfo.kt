package pt.ira.token

/**
 * Informação tipificada de um token codificado (hashed) por um [TokenEncoder].
 *
 * Esta classe encapsula o valor criptográfico resultante da transformação de um token,
 * garantindo que apenas o hash seguro é armazenado no servidor e nunca
 * o valor original do token.
 *
 * @property validationInfo Valor criptográfico (hash) do token, utilizado para validar
 *                          a autenticidade de pedidos futuros do cliente.
 *
 * @constructor Cria uma instância de [TokenValidationInfo] com o valor de validação fornecido.
 *
 * @see TokenEncoder
 * @see Token
 */

data class TokenValidationInfo(
    val validationInfo: String,
)
