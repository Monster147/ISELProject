import {OccurrenceType} from "../occurrence/OccurrenceType";

export interface StatsOccurrenceImportance{
    importance: OccurrenceType;
    count: number;
    percentage: number;
}