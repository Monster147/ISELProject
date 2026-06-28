import { useEffect, useState } from "react";

/**
 * Hook que monitoriza o estado de conectividade à rede na versão desktop/web.
 * Subscreve os eventos `online` e `offline` do `window` para detetar mudanças em tempo real.
 *
 * @returns Objeto com `isOnline` indicando se há ligação à internet.
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);

    window.addEventListener("online", online);
    window.addEventListener("offline", offline);

    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);

  return { isOnline };
};
