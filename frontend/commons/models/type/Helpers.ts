import { FormSection } from "./FormSection";
import { getLabelByLanguage } from "@commons/utils/getLabelByLanguage";

/**
 * Substitui ocorrências de um padrão de pesquisa num label ou título localizado.
 * Útil para substituir placeholders como `{index}` por valores reais durante
 * a expansão dinâmica de campos e secções de formulários.
 *
 * @param label Label a processar, pode ser string simples ou objeto com traduções.
 * @param searchValue Padrão a substituir (string ou RegExp).
 * @param replaceValue Valor com o qual substituir as ocorrências encontradas.
 * @param language Código da linguagem ativa para resolução do label (padrão: "en").
 * @returns String com as substituições aplicadas.
 */
function replaceLabelText(
  label: string | { pt: string; en: string; es: string } | undefined,
  searchValue: RegExp | string,
  replaceValue: string,
  language: string = "en",
): string {
  const labelStr = getLabelByLanguage(label, language);
  return labelStr.replace(searchValue, replaceValue);
}

/**
 * Expande os campos de uma secção de formulário dinâmico, resolvendo os placeholders `{index}`.
 *
 * Campos com `repeatedFor` são replicados N vezes, onde N é o valor do campo indicado.
 * Campos sem `repeatedFor` têm o `{index}` substituído pelo `sectionIndex` da secção pai,
 * caso este esteja definido; caso contrário, são incluídos sem alterações.
 * Em ambos os casos, o `name`, `label` e `dynamicOptions.autofill` são atualizados
 * para refletir o índice correto.
 *
 * @param fields Lista de campos do formulário a expandir.
 * @param formValues Valores atuais do formulário, usados para determinar o número de repetições.
 * @param sectionIndex Índice da secção pai, usado para substituir `{index}` em campos não repetidos.
 * @param language Código da linguagem para localizar os labels (por omissão: "en").
 * @returns Lista de campos expandidos e resolvidos, prontos para renderização.
 */
function expandFields(
  fields: any[],
  formValues: Record<string, any>,
  sectionIndex?: string,
  language: string = "en",
) {
  const result: any[] = [];

  for (const field of fields) {
    const repeatKey = field.repeatedFor;

    if (repeatKey) {
      const count = Math.max(0, Number(formValues[repeatKey] ?? 0));

      for (let i = 0; i < count; i++) {
        const index = String(i);
        const expandedAutofill = field.dynamicOptions?.autofill
          ? Object.fromEntries(
              Object.entries(field.dynamicOptions.autofill).map(
                ([key, value]) => [key.replace(/\{index\}/g, index), value],
              ),
            )
          : undefined;
        result.push({
          ...field,
          name: field.name.replace(/\{index\}/g, index),
          label: replaceLabelText(
            field.label,
            /\{index\}/g,
            String(i + 1),
            language,
          ),
          dynamicOptions: field.dynamicOptions
            ? {
                ...field.dynamicOptions,
                autofill: expandedAutofill,
              }
            : undefined,
        });
      }

      continue;
    }

    result.push({
      ...field,
      name: sectionIndex
        ? field.name.replace(/\{index\}/g, sectionIndex)
        : field.name,
      label: sectionIndex
        ? replaceLabelText(field.label, /\{index\}/g, sectionIndex, language)
        : field.label,
      dynamicOptions:
        sectionIndex && field.dynamicOptions?.autofill
          ? {
              ...field.dynamicOptions,
              autofill: Object.fromEntries(
                Object.entries(field.dynamicOptions.autofill).map(
                  ([key, value]) => [
                    key.replace(/\{index\}/g, sectionIndex),
                    value,
                  ],
                ),
              ),
            }
          : field.dynamicOptions,
    });
  }

  return result;
}

/**
 * Expande as secções de um formulário dinâmico consoante os valores atuais do formulário.
 *
 * Secções com `repeatFor` são replicadas N vezes, onde N é o valor do campo indicado.
 * Os campos dentro de cada secção têm os seus `name`, `label` e `dynamicOptions.autofill`
 * atualizados para refletir o índice da repetição (substituindo `{index}`).
 *
 * @param sections Lista de secções do formulário a expandir.
 * @param formValues Valores atuais do formulário, usados para determinar o número de repetições.
 * @param language Código da linguagem para localizar os labels (por omissão: "en").
 * @returns Lista de secções expandidas e resolvidas, prontas para renderização.
 */
export function expandSections(
  sections: FormSection[],
  formValues: Record<string, any>,
  language: string = "en",
): FormSection[] {
  const result: FormSection[] = [];

  for (const section of sections) {
    const repeatKey = section.repeatFor;

    if (repeatKey) {
      const count = Math.max(0, Number(formValues[repeatKey] ?? 0));

      for (let i = 0; i < count; i++) {
        const index = String(i);

        result.push({
          ...section,
          title: replaceLabelText(
            section.title,
            /\{index\}/g,
            String(i + 1),
            language,
          ),
          fields: expandFields(section.fields, formValues, index, language),
        });
      }

      continue;
    }

    result.push({
      ...section,
      fields: expandFields(section.fields, formValues, undefined, language),
    });
  }

  return result;
}
