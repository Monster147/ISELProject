import {OccurrenceType} from "./OccurrenceType";
import {Json} from "../utils/Json";

export interface OccurrenceCreateInput{
    usersId: number,
    date: string;
    importance: OccurrenceType;
    occurrenceType: number;
    occurrenceInfo: Json;
}