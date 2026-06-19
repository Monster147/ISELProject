import { createContext, useCallback, useContext, useState } from "react";
import {
  useListenAllListener,
  SSEMessage,
} from "../hooks/useListenAllListener";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useAuth } from "../hooks/useAuth";

type SyncSSEContextValue = {
  lastEvent?: SSEMessage;
};

export const SyncSSEContext = createContext<SyncSSEContextValue | undefined>(
  undefined,
);

export const SyncSSEProvider = ({ children }) => {
  const { isOnline } = useNetworkStatus();
  const { user } = useAuth();
  const [lastEvent, setLastEvent] = useState<SSEMessage | undefined>();

  const handleOnMessage = useCallback(async (message: SSEMessage) => {
    setLastEvent(message);
  }, []);

  useListenAllListener(user?.id, handleOnMessage, isOnline);

  return (
    <SyncSSEContext.Provider value={{ lastEvent }}>
      {children}
    </SyncSSEContext.Provider>
  );
};
