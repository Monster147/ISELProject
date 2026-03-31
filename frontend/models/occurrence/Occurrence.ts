import { OccurrenceType } from "./OccurrenceType";

export interface Occurrence {
    id: number;
    initDate: string;
    endDate: string;
    reporterId: number[];
    importance: OccurrenceType;
}
