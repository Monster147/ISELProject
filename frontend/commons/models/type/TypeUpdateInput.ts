import { Json } from "../utils/Json";

/**
 * Dados para atualizar um tipo de ocorrência. Campos nulos são ignorados.
 * @property name Novo nome, ou null para manter o atual.
 * @property form Nova estrutura do formulário, ou null para manter a atual.
 */
export interface TypeUpdateInput {
  name: string | null;
  form: Json | null;
}
