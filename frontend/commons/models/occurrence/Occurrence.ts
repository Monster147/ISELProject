import { OccurrenceType } from "./OccurrenceType";
import { Json } from "../utils/Json";

/**
 * Representa uma ocorrência registada no sistema.
 * @property id Identificador único.
 * @property initDate Data de início (YYYY-MM-DD).
 * @property endDate Data de fim (YYYY-MM-DD).
 * @property reporterId Identificador do utilizador que a registou.
 * @property importance Nível de importância.
 * @property occurrenceType Identificador do tipo de ocorrência.
 * @property occurrenceInfo Dados dinâmicos do formulário em JSON.
 * @property intervenors IDs dos intervenientes associados.
 * @property evidence IDs das evidências associadas.
 */
export interface Occurrence {
  id: number;
  initDate: string;
  endDate: string;
  reporterId: number;
  importance: OccurrenceType;
  occurrenceType: number;
  occurrenceInfo: Json;
  intervenors: number[];
  evidence: number[];
}
