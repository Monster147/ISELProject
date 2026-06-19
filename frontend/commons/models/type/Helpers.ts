import { FormSection } from "./FormSection";
import { getLabelByLanguage } from "@commons/utils/getLabelByLanguage";

function replaceLabelText(
  label: string | { pt: string; en: string; es: string } | undefined,
  searchValue: RegExp | string,
  replaceValue: string,
  language: string = "pt",
): string {
  const labelStr = getLabelByLanguage(label, language);
  return labelStr.replace(searchValue, replaceValue);
}

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
