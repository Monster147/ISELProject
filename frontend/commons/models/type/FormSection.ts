import {FormField} from "./FormField";

export interface FormSection {
    title: string;
    fields: FormField[];
    repeatFor?: string;
}