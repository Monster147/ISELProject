import { FieldType } from "./FieldType";
import { SelectOption } from "./SelectOption";
import { DynamicOptions } from "./DynamicOptions";

/**
 * Campo de um formulário dinâmico de ocorrência.
 * @property name Nome único do campo (chave nos valores do formulário).
 * @property label Rótulo, pode ser string ou objeto com traduções.
 * @property type Tipo do campo, determina o componente de input.
 * @property required Se true, o campo é obrigatório.
 * @property readOnly Se true, apenas de leitura.
 * @property options Opções estáticas para campos select.
 * @property dynamicOptions Configuração de opções dinâmicas.
 * @property min Valor mínimo para campos numéricos.
 * @property max Valor máximo para campos numéricos.
 * @property repeatedFor Campo numérico que controla quantas vezes este campo é repetido.
 */
export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  readOnly?: boolean;
  options?: SelectOption[];
  dynamicOptions?: DynamicOptions;
  min?: number;
  max?: number;
  repeatedFor?: string;
}
