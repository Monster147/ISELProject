import { useEffect, useRef, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

/**
 * Hook que monitoriza o estado de conectividade à rede na plataforma móvel.
 * Usa `NetInfo` para detetar mudanças em tempo real, verificando tanto a ligação
 * como a acessibilidade à internet.
 *
 * @returns Objeto com `isOnline` (boolean | null) e `shouldResetListeners` (boolean).
 *          `isOnline` é null até à primeira leitura do estado de rede.
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [shouldResetListeners, setShouldResetListeners] = useState(false);
  const previousStateRef = useRef<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected === true;
      const isReachable = state.isInternetReachable === true;
      const newState = isConnected && isReachable;

      if (
        previousStateRef.current !== null &&
        previousStateRef.current !== newState
      ) {
        setShouldResetListeners(true);

        setTimeout(() => {
          setShouldResetListeners(false);
        }, 100);
      }

      previousStateRef.current = newState;
      setIsOnline(newState);
    });

    return () => unsubscribe();
  }, []);

  return { isOnline, shouldResetListeners };
};
