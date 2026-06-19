import { createContext, useCallback, useEffect, useState } from "react";
import { Documents } from "@commons/models/documents/Documents";
import { api } from "@commons/api/api";
import { useAuth } from "@hooks/data/useAuth";
import {
  useDocumentsListener,
  SSEMessage,
} from "@hooks/listeners/useDocumentsListener";
import { useNetworkStatus } from "@hooks/system/useNetworkStatus";

type DocumentContextValue = {
  documents: Documents[];
  getAllDocuments: () => Promise<any>;
  getDocumentById: (id: number) => Promise<any>;
  getDocumentByName: (name: string) => Promise<any>;
  getDocumentByType: (type: string) => Promise<any>;
  getAllDocumentTypes: () => Promise<any>;
  downloadDocument: (id: number) => Promise<any>;
  loading: boolean;
};

export const DocumentContext = createContext<DocumentContextValue | undefined>(
  undefined,
);

export function DocumentProvider({ children }) {
  const [documents, setDocuments] = useState<Documents[]>([]);
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isOnline) {
      getAllDocuments();
    }
  }, [user, isOnline]);

  const handleOnMessage = useCallback((message: SSEMessage) => {
    setLoading(true);
    const data = message.data;
    const action = message.action;
    switch (action) {
      case "DocumentsChanged":
        setDocuments(data.documents);
        break;
      default:
        break;
    }
    setTimeout(() => setLoading(false), 300);
  }, []);

  useDocumentsListener(user?.id, handleOnMessage, isOnline);

  async function getAllDocuments() {
    try {
      const response = await api.getAllDocument();
      setDocuments(response);
    } catch (err: any) {
      throw Error(err.message);
    }
  }

  async function getDocumentById(id: number) {
    try {
      const response = await api.getDocumentById(id);
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }

  async function getDocumentByName(name: string) {
    try {
      const response = await api.getDocumentByName(name);
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }

  async function getDocumentByType(type: string) {
    try {
      const response = await api.getDocumentByType(type);
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }

  async function getAllDocumentTypes() {
    try {
      const response = await api.getAllDocumentTypes();
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }

  async function downloadDocument(id: number) {
    try {
      await api.downloadDocument(id);
    } catch (err: any) {
      throw Error(err.message);
    }
  }

  return (
    <DocumentContext.Provider
      value={{
        getAllDocumentTypes,
        getDocumentByType,
        getDocumentByName,
        getDocumentById,
        getAllDocuments,
        documents,
        downloadDocument,
        loading,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}
