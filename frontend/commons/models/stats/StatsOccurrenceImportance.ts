import { OccurrenceType } from "../occurrence/OccurrenceType";

/**
 * Distribuição de ocorrências por nível de importância.
 * @property importance Nível de importância.
 * @property count Número de ocorrências.
 * @property percentage Percentagem face ao total.
 */
export interface StatsOccurrenceImportance {
  importance: OccurrenceType;
  count: number;
  percentage: number;
}
