/**
 * Credenciais para autenticar um utilizador e obter um token de sessão.
 * @property email Endereço de email.
 * @property password Palavra-passe.
 */
export interface UserCreateTokenInputModel {
  email: string;
  password: string;
}
