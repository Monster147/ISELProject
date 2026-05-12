import {FieldType} from "./FieldType";
import {SelectOption} from "./SelectOption";
import {DynamicOptions} from "./DynamicOptions";

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