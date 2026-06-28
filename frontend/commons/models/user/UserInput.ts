/**
 * Dados para registar um novo utilizador.
 * @property name Nome completo.
 * @property email Endereço de email (deve ser único).
 * @property password Palavra-passe escolhida.
 */
export interface UserInput {
  name: string;
  email: string;
  password: string;
}
