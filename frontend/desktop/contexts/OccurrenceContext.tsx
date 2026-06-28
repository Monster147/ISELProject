import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "@commons/api/api";
import { Occurrence } from "@commons/models/occurrence/Occurrence";
import { useAuth } from "@hooks/data/useAuth";
import {
  SSEMessage,
  useOccurrencesListener,
} from "@hooks/listeners/useOccurrencesListener";
import { useNetworkStatus } from "@hooks/system/useNetworkStatus";

type OccurrenceContextValue = {
  listOccurrences: () => Promise<void>;
  occurrence: Occurrence[];
  getOccurrence: (id: number) => Promise<Occurrence>;
  addIntervenorToOccurrence: (
    intervenorId: number,
    occurrenceId: number,
  ) => Promise<void>;
  removeIntervenorFromOccurrence: (
    intervenorId: number,
    occurrenceId: number,
  ) => Promise<void>;
  loading: boolean;
};

/**
 * Provider que gere o estado e as operações de ocorrências na aplicação desktop.
 * Carrega as ocorrências do utilizador autenticado automaticamente quando online,
 * e subscreve atualizações em tempo real via SSE através do {@link useOccurrencesListener}.
 *
 * @param children Componentes filhos que terão acesso ao contexto de ocorrências.
 */
export const OccurrenceContext = createContext<
  OccurrenceContextValue | undefined
>(undefined);

export function OccurrenceProvider({ children }) {
  const [occurrence, setOccurrence] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();

  const listOccurrences = useCallback(async () => {
    try {
      if (!user) return;
      const response = await api.findOccurrencesByReporterId(user.id);
      setOccurrence(response);
    } catch (err: any) {
      throw Error(err.message);
    }
  }, [user]);

  const getOccurrence = useCallback(
    async (id: number) => {
      try {
        if (!user) return;
        const response = await api.findOccurrenceById(id);
        return response;
      } catch (err: any) {
        throw Error(err.message);
      }
    },
    [user],
  );

  const addIntervenorToOccurrence = useCallback(
    async (intervenorId: number, occurrenceId: number) => {
      try {
        if (!user) return;
        await api.addIntervenor({ intervenorId }, occurrenceId);
        const response = await api.findOccurrencesByReporterId(user.id);
        setOccurrence(response);
      } catch (err: any) {
        throw Error(err.message);
      }
    },
    [user],
  );

  const removeIntervenorFromOccurrence = useCallback(
    async (intervenorId: number, occurrenceId: number) => {
      try {
        if (!user) return;
        await api.removeIntervenor({ intervenorId }, occurrenceId);
        const response = await api.findOccurrencesByReporterId(user.id);
        setOccurrence(response);
      } catch (err: any) {
        throw Error(err.message);
      }
    },
    [user],
  );

  useEffect(() => {
    if (user && isOnline) {
      listOccurrences();
    }
  }, [user, isOnline, listOccurrences]);

  const handleOnMessage = useCallback((message: SSEMessage) => {
    setLoading(true);
    const data = message.data;
    const action = message.action;
    switch (action) {
      case "OccurrencesChanged":
        setOccurrence(data.occurrences);
        break;
      default:
        break;
    }
    setTimeout(() => setLoading(false), 300);
  }, []);

  useOccurrencesListener(user?.id, handleOnMessage, isOnline);

  const value = useMemo(
    () => ({
      occurrence,
      listOccurrences,
      getOccurrence,
      addIntervenorToOccurrence,
      removeIntervenorFromOccurrence,
      loading,
    }),
    [
      occurrence,
      loading,
      listOccurrences,
      getOccurrence,
      addIntervenorToOccurrence,
      removeIntervenorFromOccurrence,
    ],
  );

  return (
    <OccurrenceContext.Provider value={value}>
      {children}
    </OccurrenceContext.Provider>
  );
}
