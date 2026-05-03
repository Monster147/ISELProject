import * as SecureStore from 'expo-secure-store'
import {OccurrenceType} from "@commons/models/occurrence/OccurrenceType";
import {Json} from "@commons/models/utils/Json";
import {Type} from "@commons/models/type/Type";

export interface TypeInfo{
    id: number;
    name: string;
    form: Json;
}

export interface TypeInfoRepo {

    saveTypeInfo(intervenorInfo: TypeInfo[]): Promise<void>

    getTypeInfo(): Promise<TypeInfo[] | null>

    clearTypeInfo(): Promise<void>
}

export class TypeInfoPreferencesRepo implements TypeInfoRepo {

    private TYPE_KEY = "type"

    async saveTypeInfo(intervenorInfo: TypeInfo[]): Promise<void> {
        await SecureStore.setItemAsync(this.TYPE_KEY, JSON.stringify(intervenorInfo))
    }

    async getTypeInfo(): Promise<TypeInfo[] | null> {
        const type = await SecureStore.getItemAsync(this.TYPE_KEY)
        if (!type) return null
        return JSON.parse(type) as TypeInfo[]
    }

    async clearTypeInfo(): Promise<void> {
        await SecureStore.deleteItemAsync(this.TYPE_KEY)
    }
}

export const typeInfoRepo = new TypeInfoPreferencesRepo()