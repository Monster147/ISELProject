import { Json } from "../utils/Json";

/**
 * Dados para criar um novo tipo de ocorrência.
 * @property name Nome do tipo.
 * @property form Estrutura do formulário em JSON.
 */
export interface TypeCreateInput {
  name: string;
  form: Json;
}
