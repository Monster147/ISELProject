import * as SecureStore from 'expo-secure-store'
import {OccurrenceType} from "@commons/models/occurrence/OccurrenceType";
import {Json} from "@commons/models/utils/Json";

export interface EvidenceInfo{
    id: number;
    type: Json;
    filePath: string;
    location: string;
    description: string;
    reporterId: number;
    reportId: number;
    createdAt: number;
    updatedAt: number;
}

export interface EvidenceInfoRepo {

    saveEvidenceInfo(evidenceInfo: EvidenceInfo[]): Promise<void>

    getEvidenceInfo(): Promise<EvidenceInfo[] | null>

    clearEvidenceInfo(): Promise<void>
}

export class EvidenceInfoPreferencesRepo implements EvidenceInfoRepo {

    private OCCURRENCE_KEY = "evidence"

    async saveEvidenceInfo(occurrenceInfo: EvidenceInfo[]): Promise<void> {
        await SecureStore.setItemAsync(this.OCCURRENCE_KEY, JSON.stringify(occurrenceInfo))
    }

    async getEvidenceInfo(): Promise<EvidenceInfo[] | null> {
        const evidence = await SecureStore.getItemAsync(this.OCCURRENCE_KEY)
        if (!evidence) return null
        return JSON.parse(evidence) as EvidenceInfo[]
    }

    async clearEvidenceInfo(): Promise<void> {
        await SecureStore.deleteItemAsync(this.OCCURRENCE_KEY)
    }
}

export const evidenceInfoRepo = new EvidenceInfoPreferencesRepo()