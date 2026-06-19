import { createContext, useEffect, useState } from "react";
import { Documents } from "@commons/models/documents/Documents";
import { api } from "@commons/api/api";
import { useAuth } from "@hooks/data/useAuth";
import { useNetworkStatus } from "@hooks/system/useNetworkStatus";
import { documentsInfoRepo } from "@infrastructure/DocumentsInfoPreferencesRepo";
import { useSyncSSE } from "@hooks/sync/useSyncSSE";

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
  const { isOnline, shouldResetListeners } = useNetworkStatus();
  const [loading, setLoading] = useState(false);
  const { lastEvent } = useSyncSSE();

  useEffect(() => {
    if (user) {
      if (isOnline) {
        getAllDocuments();
      } else {
        loadCachedDocuments();
      }
    }
  }, [user, isOnline]);

  useEffect(() => {
    const handleDocumentsChanged = async () => {
      if (!lastEvent) return;
      if (lastEvent?.action === "DocumentsChanged") {
        setLoading(true);
        const value = lastEvent.data;
        const documents: Documents[] = Array.isArray(value) ? value : [];
        setDocuments(documents);
        await documentsInfoRepo.saveDocumentsInfo(documents);
        const timer = setTimeout(() => setLoading(false), 300);
        return () => clearTimeout(timer);
      }
    };

    handleDocumentsChanged();
  }, [lastEvent]);
  /*
    const handleOnMessage = useCallback(async (message: SSEMessage) => {
        setLoading(true)
        const data = message.data
        const action = message.action
        switch (action) {
            case "DocumentsChanged":
                setDocuments(data.documents)
                await documentsInfoRepo.saveDocumentsInfo(data.documents)
                break
            default:
                break
        }
        setTimeout(() => setLoading(false), 300);
    }, [])

    useDocumentsListener(user?.id,handleOnMessage, isOnline)

     */

  async function getAllDocuments() {
    setLoading(true);
    try {
      const response = await api.getAllDocument();
      setDocuments(response);
      await documentsInfoRepo.saveDocumentsInfo(response);
    } catch (err: any) {
      loadCachedDocuments();
    } finally {
      setLoading(false);
    }
  }

  async function loadCachedDocuments() {
    setLoading(true);
    const cached = await documentsInfoRepo.getDocumentsInfo();
    if (cached) {
      setDocuments(cached);
    } else {
      setDocuments([]);
    }
    setLoading(false);
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
