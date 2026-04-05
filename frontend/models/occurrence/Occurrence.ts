import { OccurrenceType } from "./OccurrenceType";
import {Json} from "../utils/Json";

export interface Occurrence {
    id: number;
    initDate: string;
    endDate: string;
    reporterId: number;
    importance: OccurrenceType;
    occurrenceType: Json;
    occurrenceInfo: Json;
    intervenors: number[];
    evidence:number[];
}
