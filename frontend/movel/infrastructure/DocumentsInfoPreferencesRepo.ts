import AsyncStorage from "@react-native-async-storage/async-storage";

export interface DocumentsInfo {
  id: number;
  name: string;
  type: string;
  filepath: string;
}

export interface DocumentsInfoRepo {
  saveDocumentsInfo(intervenorInfo: DocumentsInfo[]): Promise<void>;

  getDocumentsInfo(): Promise<DocumentsInfo[] | null>;

  clearDocumentsInfo(): Promise<void>;
}

export class DocumentsInfoPreferencesRepo implements DocumentsInfoRepo {
  private DOCUMENTS_KEY = "documents";

  async saveDocumentsInfo(intervenorInfo: DocumentsInfo[]): Promise<void> {
    await AsyncStorage.setItem(
      this.DOCUMENTS_KEY,
      JSON.stringify(intervenorInfo),
    );
  }

  async getDocumentsInfo(): Promise<DocumentsInfo[] | null> {
    const documents = await AsyncStorage.getItem(this.DOCUMENTS_KEY);
    if (!documents) return null;
    return JSON.parse(documents) as DocumentsInfo[];
  }

  async clearDocumentsInfo(): Promise<void> {
    await AsyncStorage.removeItem(this.DOCUMENTS_KEY);
  }
}

export const documentsInfoRepo = new DocumentsInfoPreferencesRepo();
