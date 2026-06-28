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

/**
 * Provider que gere o estado e as operações de documentos na aplicação desktop.
 * Carrega os documentos automaticamente quando o utilizador está autenticado e online,
 * e subscreve atualizações em tempo real via SSE através do {@link useDocumentsListener}.
 *
 * @param children Componentes filhos que terão acesso ao contexto de documentos.
 */
export function DocumentProvider({ children }) {
  const [documents, setDocuments] = useState<Documents[]>([]);
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const [loading, setLoading] = useState(false);

  const getAllDocuments = useCallback(async () => {
    try {
      const response = await api.getAllDocument();
      setDocuments(response);
    } catch (err: any) {
      throw Error(err.message);
    }
  }, []);

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
    if (user && isOnline) {
      getAllDocuments();
    }
  }, [user, isOnline, getAllDocuments]);

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
      getAllDocuments,
      getDocumentById,
      getDocumentByName,
      getDocumentByType,
      getAllDocumentTypes,
      downloadDocument,
    ],
  );

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}
