package pt.ira.user

import java.time.Duration

/**
 * Representa a configuração de políticas de segurança e gestão de *tokens* do domínio de utilizadores.
 *
 * Esta classe encapsula os parâmetros críticos que definem o comportamento dos *tokens* de sessão,
 * incluindo o seu tamanho criptográfico, duração de vida e limite de *tokens* simultâneos por utilizador.
 * Todas as propriedades são validadas no inicializador para garantir que os valores respeitam
 * os critérios de segurança mínimos.
 *
 * @property tokenSizeInBytes Tamanho em bytes do *token* gerado criptograficamente.
 *                            Deve ser um valor positivo.
 * @property tokenTtl Duração total de vida de um *token* desde a sua criação.
 *                    Após este período, o *token* expira automaticamente.
 * @property tokenRollingTtl Duração de inatividade permitida antes de invalidação do *token*.
 *                           Um *token* ativo (em uso) pode estender a sua validade enquanto não
 *                           ultrapassar este limite de inatividade.
 * @property maxTokensPerUser Número máximo de *tokens* válidos permitidos por utilizador em simultâneo,
 *                            prevenindo multiplicação excessiva de sessões abertas.
 *
 * @constructor Cria uma instância de [UsersDomainConfig] com as políticas de segurança,
 *              validando que todos os parâmetros respeitam os critérios de negócio.
 *
 * @throws IllegalArgumentException Se algum dos parâmetros não cumprir as validações do inicializador.
 */

data class UsersDomainConfig(
    val tokenSizeInBytes: Int,
    val tokenTtl: Duration,
    val tokenRollingTtl: Duration,
    val maxTokensPerUser: Int,
) {
    init {
        require(tokenSizeInBytes > 0)
        require(tokenTtl.isPositive)
        require(tokenRollingTtl.isPositive)
        require(maxTokensPerUser > 0)
    }
}
