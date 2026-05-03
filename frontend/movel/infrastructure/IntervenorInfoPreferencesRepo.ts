import * as SecureStore from 'expo-secure-store'
import {OccurrenceType} from "@commons/models/occurrence/OccurrenceType";
import {Json} from "@commons/models/utils/Json";

export interface IntervenorInfo{
    id: number;
    idNumber: string;
    idType: string;
    name: string;
    contactInfo: string;
    address: string;
}

export interface IntervenorInfoRepo {

    saveIntervenorInfo(intervenorInfo: IntervenorInfo[]): Promise<void>

    getIntervenorInfo(): Promise<IntervenorInfo[] | null>

    clearIntervenorInfo(): Promise<void>
}

export class IntervenorInfoPreferencesRepo implements IntervenorInfoRepo {

    private INTERVENOR_KEY = "intervenors"

    async saveIntervenorInfo(intervenorInfo: IntervenorInfo[]): Promise<void> {
        await SecureStore.setItemAsync(this.INTERVENOR_KEY, JSON.stringify(intervenorInfo))
    }

    async getIntervenorInfo(): Promise<IntervenorInfo[] | null> {
        const intervenors = await SecureStore.getItemAsync(this.INTERVENOR_KEY)
        if (!intervenors) return null
        return JSON.parse(intervenors) as IntervenorInfo[]
    }

    async clearIntervenorInfo(): Promise<void> {
        await SecureStore.deleteItemAsync(this.INTERVENOR_KEY)
    }
}

export const intervenorInfoRepo = new IntervenorInfoPreferencesRepo()