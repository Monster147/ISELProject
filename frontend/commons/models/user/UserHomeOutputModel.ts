/**
 * Dados do utilizador retornados pela API ao consultar o perfil.
 * @property id Identificador único.
 * @property name Nome.
 * @property email Endereço de email.
 * @property roles IDs dos cargos do utilizador.
 */
export interface UserHomeOutputModel {
  id: number;
  name: string;
  email: string;
  roles: number[];
}
