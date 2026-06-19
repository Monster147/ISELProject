import { createContext, useCallback, useState } from "react";
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
