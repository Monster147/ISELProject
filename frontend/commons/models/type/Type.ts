import { Json } from "../utils/Json";

/**
 * Tipo de ocorrência registado no sistema.
 * @property id Identificador único.
 * @property name Nome do tipo.
 * @property form Estrutura do formulário dinâmico em JSON.
 */
export interface Type {
  id: number;
  name: string;
  form: Json;
}
