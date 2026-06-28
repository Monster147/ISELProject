/**
 * Utilizador autenticado no sistema.
 * @property id Identificador único.
 * @property name Nome completo.
 * @property email Endereço de email.
 * @property roles IDs dos cargos atribuídos.
 */
export interface User {
  id: number;
  name: string;
  email: string;
  roles: number[];
}
