import { FormSection } from "./FormSection";

/**
 * Estrutura completa do formulário dinâmico de um tipo de ocorrência.
 * @property type Identificador ou nome do tipo de ocorrência.
 * @property sections Secções que compõem o formulário.
 */
export interface OccurrenceTypeForm {
  type: string;
  sections: FormSection[];
}
