import AsyncStorage from "@react-native-async-storage/async-storage";
import { Json } from "@commons/models/utils/Json";

export interface TypeInfo {
  id: number;
  name: string;
  form: Json;
}

export interface TypeInfoRepo {
  saveTypeInfo(intervenorInfo: TypeInfo[]): Promise<void>;

  getTypeInfo(): Promise<TypeInfo[] | null>;

  clearTypeInfo(): Promise<void>;
}

/**
 * Implementação de {@link TypeInfoRepo} que persiste a lista de tipos de ocorrência
 * em cache local usando `AsyncStorage`, serializada em JSON com a chave `"type"`.
 */
export class TypeInfoPreferencesRepo implements TypeInfoRepo {
  private TYPE_KEY = "type";

  async saveTypeInfo(intervenorInfo: TypeInfo[]): Promise<void> {
    await AsyncStorage.setItem(this.TYPE_KEY, JSON.stringify(intervenorInfo));
  }

  async getTypeInfo(): Promise<TypeInfo[] | null> {
    const type = await AsyncStorage.getItem(this.TYPE_KEY);
    if (!type) return null;
    return JSON.parse(type) as TypeInfo[];
  }

  async clearTypeInfo(): Promise<void> {
    await AsyncStorage.removeItem(this.TYPE_KEY);
  }
}

export const typeInfoRepo = new TypeInfoPreferencesRepo();
