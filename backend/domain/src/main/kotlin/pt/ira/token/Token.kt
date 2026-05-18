package pt.ira.token

import java.time.Instant

/**
 * Representa um token de autenticação e sessão no sistema.
 *
 * Um token encapsula a informação criptográfica necessária para validar a identidade
 * de um utilizador, juntamente com metadados temporais que permitem o rastreamento
 * e gestão do ciclo de vida da sessão. O token em si nunca é armazenado diretamente,
 * apenas o seu hash criptográfico.
 *
 * @property tokenValidationInfo Informação criptográfica do token (hash SHA-256),
 *                                utilizada para validar pedidos futuros do utilizador.
 * @property userId Identificador do utilizador a quem este token foi atribuído.
 * @property createdAt Timestamp do momento exacto em que o token foi gerado.
 * @property lastUsedAt Timestamp da última utilização bem-sucedida deste token,
 *                      permitindo rastreamento de atividade e detecção de sessões.
 *
 * @constructor Cria uma instância de [Token] com os dados de autenticação
 *              e rastreamento temporal necessários para gerir a sessão do utilizador.
 */

data class Token(
    val tokenValidationInfo: TokenValidationInfo,
    val userId: Int,
    val createdAt: Instant,
    val lastUsedAt: Instant,
)
