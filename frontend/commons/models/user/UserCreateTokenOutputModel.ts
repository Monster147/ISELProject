/**
 * Resposta da API após autenticação bem-sucedida.
 * @property token Token Bearer a incluir nas chamadas subsequentes à API.
 */
export interface UserCreateTokenOutputModel {
  token: string;
}
