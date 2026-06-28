/**
 * Input para redefinir todos os cargos de um utilizador.
 * @property rolesIds Lista de IDs dos cargos a atribuir.
 * @property userId Identificador do utilizador.
 */
export interface RolesInput {
  rolesIds: number[];
  userId: number;
}
