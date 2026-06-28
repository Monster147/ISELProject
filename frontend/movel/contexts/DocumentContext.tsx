import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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

/**
 * Provider que gere o estado e as operações de documentos na aplicação móvel.
 * Suporta modo offline: tenta carregar da API quando online, com fallback
 * para cache local ({@link documentsInfoRepo}). Subscreve atualizações SSE via {@link useSyncSSE}.
 *
 * @param children Árvore de componentes que terão acesso ao contexto de documentos.
 */
export function DocumentProvider({ children }) {
  const [documents, setDocuments] = useState<Documents[]>([]);
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const [loading, setLoading] = useState(false);
  const { lastEvent } = useSyncSSE();

  const loadCachedDocuments = useCallback(async () => {
    setLoading(true);
    const cached = await documentsInfoRepo.getDocumentsInfo();
    if (cached) {
      setDocuments(cached);
    } else {
      setDocuments([]);
    }
    setLoading(false);
  }, []);

  const getAllDocuments = useCallback(async () => {
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
  }, [loadCachedDocuments]);

  const getDocumentById = useCallback(async (id: number) => {
    try {
      const response = await api.getDocumentById(id);
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }, []);

  const getDocumentByName = useCallback(async (name: string) => {
    try {
      const response = await api.getDocumentByName(name);
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }, []);

  const getDocumentByType = useCallback(async (type: string) => {
    try {
      const response = await api.getDocumentByType(type);
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }, []);

  const getAllDocumentTypes = useCallback(async () => {
    try {
      const response = await api.getAllDocumentTypes();
      return response;
    } catch (err: any) {
      throw Error(err.message);
    }
  }, []);

  const downloadDocument = useCallback(async (id: number) => {
    try {
      await api.downloadDocument(id);
    } catch (err: any) {
      throw Error(err.message);
    }
  }, []);

  useEffect(() => {
    if (user) {
      if (isOnline) {
        getAllDocuments();
      } else {
        loadCachedDocuments();
      }
    }
  }, [user, isOnline, getAllDocuments, loadCachedDocuments]);

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

  const value = useMemo(
    () => ({
      getAllDocumentTypes,
      getDocumentByType,
      getDocumentByName,
      getDocumentById,
      getAllDocuments,
      documents,
      downloadDocument,
      loading,
    }),
    [
      documents,
      loading,
      getAllDocumentTypes,
      getDocumentByType,
      getDocumentByName,
      getDocumentById,
      getAllDocuments,
      downloadDocument,
    ],
  );

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}
