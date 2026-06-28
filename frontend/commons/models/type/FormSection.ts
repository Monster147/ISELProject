import { FormField } from "./FormField";

/**
 * Secção de um formulário dinâmico de ocorrência.
 * @property title Título da secção, pode ser string ou objeto com traduções.
 * @property fields Lista de campos da secção.
 * @property repeatFor Campo numérico que define quantas vezes a secção é repetida.
 */
export interface FormSection {
  title: string;
  fields: FormField[];
  repeatFor?: string;
}
