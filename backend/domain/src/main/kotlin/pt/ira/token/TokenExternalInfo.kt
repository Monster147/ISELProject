package pt.ira.token

import java.time.Instant

/**
 * Representa a informação externa de um *token* destinada ao cliente.
 *
 * Este modelo encapsula os dados transmitidos ao utilizador aquando da autenticação
 * bem-sucedida. Ao contrário de [Token], que armazena o hash seguro do *token*, esta classe
 * contém o valor do *token* em claro (único segredo partilhado com o cliente) e o seu tempo
 * de expiração, permitindo que o cliente saiba quando deverá renovar a sua sessão.
 *
 * @property tokenValue Valor do *token* em claro a ser enviado ao cliente para utilização
 *                      em pedidos subsequentes.
 * @property tokenExpiration Timestamp do momento em que este token expira e deixa de ser válido.
 *
 * @constructor Cria uma instância de [TokenExternalInfo] com o valor do *token*
 *              e informação temporal de validade.
 *
 * @see Token
 */

data class TokenExternalInfo(
    val tokenValue: String,
    val tokenExpiration: Instant,
)
