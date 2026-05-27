import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
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

    private EVIDENCE_KEY = "evidence"

    async saveEvidenceInfo(evidenceInfo: EvidenceInfo[]): Promise<void> {
        await AsyncStorage.setItem(this.EVIDENCE_KEY, JSON.stringify(evidenceInfo))
    }

    async getEvidenceInfo(): Promise<EvidenceInfo[] | null> {
        const evidence = await AsyncStorage.getItem(this.EVIDENCE_KEY)
        if (!evidence) return null
        return JSON.parse(evidence) as EvidenceInfo[]
    }

    async clearEvidenceInfo(): Promise<void> {
        await AsyncStorage.removeItem(this.EVIDENCE_KEY)
    }
}

export const evidenceInfoRepo = new EvidenceInfoPreferencesRepo()