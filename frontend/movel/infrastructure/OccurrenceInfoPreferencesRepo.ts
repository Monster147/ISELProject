import * as SecureStore from 'expo-secure-store'
import {OccurrenceType} from "@commons/models/occurrence/OccurrenceType";
import {Json} from "@commons/models/utils/Json";

export interface OccurrenceInfo{
    id: number;
    initDate: string;
    endDate: string;
    reporterId: number;
    importance: OccurrenceType;
    occurrenceType: number;
    occurrenceInfo: Json;
    intervenors: number[];
    evidence:number[];
}

export interface OccurrenceInfoRepo {

    saveOccurrenceInfo(occurrenceInfo: OccurrenceInfo[]): Promise<void>

    getOccurrenceInfo(): Promise<OccurrenceInfo[] | null>

    clearOccurrenceInfo(): Promise<void>
}

export class OccurrenceInfoPreferencesRepo implements OccurrenceInfoRepo {

    private OCCURRENCE_KEY = "occurrence"

    async saveOccurrenceInfo(occurrenceInfo: OccurrenceInfo[]): Promise<void> {
        await SecureStore.setItemAsync(this.OCCURRENCE_KEY, JSON.stringify(occurrenceInfo))
    }

    async getOccurrenceInfo(): Promise<OccurrenceInfo[] | null> {
        const occurrence = await SecureStore.getItemAsync(this.OCCURRENCE_KEY)
        if (!occurrence) return null
        return JSON.parse(occurrence) as OccurrenceInfo[]
    }

    async clearOccurrenceInfo(): Promise<void> {
        await SecureStore.deleteItemAsync(this.OCCURRENCE_KEY)
    }
}

export const occurrenceInfoRepo = new OccurrenceInfoPreferencesRepo()