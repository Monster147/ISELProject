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
        let queue = await offlineIntervenorQueueRepo.getQueue()
        while (queue.length > 0) {
            for (const action of queue) {
                if (action.retries >= action.maxRetries) {
                    await offlineIntervenorQueueRepo.removeAction(action.id)
                    continue
                }
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
                            await api.updateIntervenor({
                                idNumber: action.payload.idNumber,
                                idType: action.payload.idType,
                                name: action.payload.name,
                                contactInfo: action.payload.contactInfo,
                                address: action.payload.address
                            }, action.payload.id)
                            await offlineIntervenorQueueRepo.removeAction(action.id)
                            break
                    }
                } catch (err: any) {
                    action.retries++
                    await offlineIntervenorQueueRepo.updateAction(action.id, action)
                }
            }
            queue = await offlineIntervenorQueueRepo.getQueue()
        }
    }

    async function syncOccurrenceQueue() {
        let queue = await offlineOccurrenceQueueRepo.getQueue()
        while (queue.length > 0) {
            for (const action of queue) {
                if (action.retries >= action.maxRetries) {
                    await offlineOccurrenceQueueRepo.removeAction(action.id)
                    continue
                }
                try {
                    switch (action.type) {
                        case "ADD_INTERVENOR":
                            const intervernorId = await api.findIntervenorByIdNumber(action.payload.intervenor.idNumber).then(i => i.id)
                            const response = await api.addIntervenor({intervenorId: intervernorId}, action.payload.occurrenceId)
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
                    if(err.status >= 500 && err.status < 600){
                        const wait = action.retries * 10
                        await delay(wait)
                        action.retries++
                        await offlineOccurrenceQueueRepo.updateAction(action.id, action)
                    }else{
                        await offlineOccurrenceQueueRepo.removeAction(action.id)
                    }
                }
            }
            queue = await offlineOccurrenceQueueRepo.getQueue()
        }
    }

    function delay(delayInMs: number) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(undefined), delayInMs);
        });
    }

    return (
        <OfflineSyncContext.Provider value={{syncAllOfflineQueues, isSyncing}}>
            {children}
        </OfflineSyncContext.Provider>
    )
}
