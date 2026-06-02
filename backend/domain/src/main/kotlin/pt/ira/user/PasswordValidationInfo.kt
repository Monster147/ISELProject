package pt.ira.user

/**
 * Representa informação tipificada da *password* de um utilizador em formato seguro.
 *
 * Esta classe encapsula o valor criptográfico (hash) da *password*, garantindo que
 * a *password* em claro nunca é armazenada no servidor. O valor de validação é utilizado
 * para verificar a autenticidade da *password* fornecida durante o processo de *login*.
 *
 * @property validationInfo Valor criptográfico (hash) da *password* do utilizador,
 *                          utilizado para validar a *password* em futuras tentativas de autenticação.
 *
 * @constructor Cria uma instância de [PasswordValidationInfo] com o hash seguro
 *              da *password* fornecida.
 *
 * @see User
 */

data class PasswordValidationInfo(
    val validationInfo: String,
)
