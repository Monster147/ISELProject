import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

export const useNetworkStatus = () => {
    const [isOnline, setIsOnline] = useState<boolean | null>(null);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const isConnected = state.isConnected === true
            const isReachable = state.isInternetReachable === true

            setIsOnline(isConnected && isReachable)
        });

        return () => unsubscribe()
    }, [])

    return { isOnline }
};