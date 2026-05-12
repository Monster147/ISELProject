import { FormSection } from "./FormSection";

function expandFields(
    fields: any[],
    formValues: Record<string, any>,
    sectionIndex?: string
) {
    const result: any[] = [];

    for (const field of fields) {
        const repeatKey = field.repeatedFor;

        if (repeatKey) {
            const count = Math.max(0, Number(formValues[repeatKey] ?? 0));

            for (let i = 0; i < count; i++) {
                const index = String(i);

                result.push({
                    ...field,
                    name: field.name.replace(/\{index\}/g, index),
                    label: field.label.replace(/\{index\}/g, String(i + 1)),
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
                ? field.label.replace(/\{index\}/g, sectionIndex)
                : field.label,
        });
    }

    return result;
}

export function expandSections(
    sections: FormSection[],
    formValues: Record<string, any>
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
                    title: section.title.replace(/\{index\}/g, String(i + 1)),
                    fields: expandFields(section.fields, formValues, index),
                });
            }

            continue;
        }

        result.push({
            ...section,
            fields: expandFields(section.fields, formValues),
        });
    }

    return result;
}