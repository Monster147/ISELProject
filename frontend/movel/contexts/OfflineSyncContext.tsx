import {createContext, useCallback, useEffect, useState} from "react";
import {Type} from "@commons/models/type/Type";
import {api} from "@commons/api/api";
import {useAuth} from "../hooks/useAuth";
import {useTypesListener, SSEMessage} from "../hooks/useTypesListener";
import {intervenorInfoRepo} from "../infrastructure/IntervenorInfoPreferencesRepo";
import {typeInfoRepo} from "../infrastructure/TypeInfopreferencesRepo";
import {useNetworkStatus} from "../hooks/useNetworkStatus";
import {offlineIntervenorQueueRepo} from "../infrastructure/offline/OfflineIntervenorQueueRepo";
import {offlineOccurrenceQueueRepo} from "../infrastructure/offline/OfflineOccurrenceQueueRepo";
import {useIntervenor} from "../hooks/useIntervenor";
import {useOccurrence} from "../hooks/useOccurrence";

type OfflineSyncContextValue = {
    syncAllOfflineQueues: () => Promise<void>
    isSyncing: boolean
}

export const OfflineSyncContext = createContext<OfflineSyncContextValue | undefined>(undefined)

export const OfflineSyncProvider = ({children}) => {
    const [isSyncing, setIsSyncing] = useState(false)
    const {isOnline} = useNetworkStatus()

    useEffect(() => {
        if (isOnline) {
            syncAllOfflineQueues()
        }
    }, [isOnline])

    const syncAllOfflineQueues = useCallback(async () => {
        setIsSyncing(true)
        try {
            await syncIntervenorQueue()
            await syncOccurrenceQueue()
        } finally {
            setIsSyncing(false)
        }
    }, []);

    async function syncIntervenorQueue() {
        const queue = await offlineIntervenorQueueRepo.getQueue()

        for (const action of queue) {
            try {
                switch (action.type) {
                    case "CREATE":
                        await api.createIntervenor({
                            idNumber: action.payload.idNumber,
                            idType: action.payload.idType,
                            name: action.payload.name,
                            contactInfo: action.payload.contactInfo,
                            address: action.payload.address
                        })
                        await offlineIntervenorQueueRepo.removeAction(action.id)
                        break
                    case "UPDATE":
                        // fazer depois ???
                        break
                }
            } catch (err: any) {
            }
        }
        await offlineIntervenorQueueRepo.clearQueue()
    }

    async function syncOccurrenceQueue() {
        const queue = await offlineOccurrenceQueueRepo.getQueue()
        for (const action of queue) {
            try {
                switch (action.type) {
                    case "ADD_INTERVENOR":
                        const intervernorId = await api.findIntervenorByIdNumber(action.payload.intervenor.idNumber).then(i => i.id)
                        await api.addIntervenor({intervenorId: intervernorId}, action.payload.occurrenceId)
                        await offlineOccurrenceQueueRepo.removeAction(action.id)
                        break
                    case "REMOVE_INTERVENOR":
                        const intervernorIdToRemove = await api.findIntervenorByIdNumber(action.payload.intervenor.idNumber).then(i => i.id)
                        await api.removeIntervenor({intervenorId: intervernorIdToRemove}, action.payload.occurrenceId)
                        await offlineOccurrenceQueueRepo.removeAction(action.id)
                        break
                    case "ADD_EVIDENCE":
                        break
                    case "REMOVE_EVIDENCE":
                        break
                }
            } catch (err: any) {
            }
        }
        await offlineOccurrenceQueueRepo.clearQueue()
    }

    return (
        <OfflineSyncContext.Provider value={{syncAllOfflineQueues, isSyncing}}>
            {children}
        </OfflineSyncContext.Provider>
    )
}
