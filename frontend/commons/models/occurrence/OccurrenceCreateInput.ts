import { OccurrenceType } from "./OccurrenceType";
import { Json } from "../utils/Json";

/**
 * Dados para criar uma nova ocorrência.
 * @property usersId Identificador do utilizador que regista.
 * @property date Data da ocorrência (YYYY-MM-DD).
 * @property importance Nível de importância.
 * @property occurrenceType Identificador do tipo de ocorrência.
 * @property occurrenceInfo Dados dinâmicos do formulário em JSON.
 */
export interface OccurrenceCreateInput {
  usersId: number;
  date: string;
  importance: OccurrenceType;
  occurrenceType: number;
  occurrenceInfo: Json;
}
