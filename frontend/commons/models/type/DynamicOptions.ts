/**
 * Configuração de opções dinâmicas para campos `select` de formulários.
 * @property source Nome da fonte de dados (ex: "intervenors").
 * @property labelField Campo a usar como rótulo visível.
 * @property valueField Campo a usar como valor submetido.
 * @property autofill Campos a preencher automaticamente ao selecionar uma opção.
 */
export interface DynamicOptions {
  source: string;
  labelField: string;
  valueField: string;
  autofill?: Record<string, string>;
}
