import { createContext, useCallback, useMemo, useState } from "react";
import {
  useListenAllListener,
  SSEMessage,
} from "@hooks/listeners/useListenAllListener";
import { useNetworkStatus } from "@hooks/system/useNetworkStatus";
import { useAuth } from "@hooks/data/useAuth";

type SyncSSEContextValue = {
  lastEvent?: SSEMessage;
};

export const SyncSSEContext = createContext<SyncSSEContextValue | undefined>(
  undefined,
);

/**
 * Provider que centraliza a receção de eventos SSE para toda a aplicação móvel.
 * Subscreve o endpoint `/api/listen/user/{userId}` via {@link useListenAllListener},
 * que agrega eventos de todos os domínios necessários (ocorrências, intervenientes, evidências, etc.).
 * Os contextos de dados subscrevem o lastEvent para reagir a mudanças em tempo real.
 *
 * @param children Árvore de componentes que terão acesso ao contexto SSE de sincronização.
 */
export const SyncSSEProvider = ({ children }) => {
  const { isOnline } = useNetworkStatus();
  const { user } = useAuth();
  const [lastEvent, setLastEvent] = useState<SSEMessage | undefined>();

  const handleOnMessage = useCallback(async (message: SSEMessage) => {
    setLastEvent(message);
  }, []);

  useListenAllListener(user?.id, handleOnMessage, isOnline);

  const value = useMemo(
    () => ({
      lastEvent,
    }),
    [lastEvent],
  );

  return (
    <SyncSSEContext.Provider value={value}>{children}</SyncSSEContext.Provider>
  );
};
