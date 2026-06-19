import { useEffect, useRef, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

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
