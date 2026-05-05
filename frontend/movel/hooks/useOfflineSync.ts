import {useContext} from "react";
import {OfflineSyncContext} from "../contexts/OfflineSyncContext";

export function useOfflineSync() {
    const context = useContext(OfflineSyncContext);
    if (!context) {
        throw new Error("useOfflineSync must be used within OfflineSyncProvider");
    }
    return context;
}