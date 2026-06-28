import AsyncStorage from "@react-native-async-storage/async-storage";
import { OccurrenceType } from "@commons/models/occurrence/OccurrenceType";
import { Json } from "@commons/models/utils/Json";

export interface OccurrenceInfo {
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

export interface OccurrenceInfoRepo {
  saveOccurrenceInfo(occurrenceInfo: OccurrenceInfo[]): Promise<void>;

  getOccurrenceInfo(): Promise<OccurrenceInfo[] | null>;

  clearOccurrenceInfo(): Promise<void>;
}

/**
 * Implementação de {@link OccurrenceInfoRepo} que persiste a lista de ocorrências
 * em cache local usando `AsyncStorage`, serializada em JSON com a chave `"occurrence"`.
 */
export class OccurrenceInfoPreferencesRepo implements OccurrenceInfoRepo {
  private OCCURRENCE_KEY = "occurrence";

  async saveOccurrenceInfo(occurrenceInfo: OccurrenceInfo[]): Promise<void> {
    await AsyncStorage.setItem(
      this.OCCURRENCE_KEY,
      JSON.stringify(occurrenceInfo),
    );
  }

  async getOccurrenceInfo(): Promise<OccurrenceInfo[] | null> {
    const occurrence = await AsyncStorage.getItem(this.OCCURRENCE_KEY);
    if (!occurrence) return null;
    return JSON.parse(occurrence) as OccurrenceInfo[];
  }

  async clearOccurrenceInfo(): Promise<void> {
    await AsyncStorage.removeItem(this.OCCURRENCE_KEY);
  }
}

export const occurrenceInfoRepo = new OccurrenceInfoPreferencesRepo();
