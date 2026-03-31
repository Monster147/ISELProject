import {OccurrenceType} from "./OccurrenceType";

export interface OccurrenceCreateInput{
    usersId: number[],
    date: string;
    importance: OccurrenceType
}