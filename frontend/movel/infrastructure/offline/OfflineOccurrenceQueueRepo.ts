import * as SecureStore from 'expo-secure-store'

export type OfflineActionType = "ADD_INTERVENOR" | "REMOVE_INTERVENOR" | "ADD_EVIDENCE" | "REMOVE_EVIDENCE"

export interface OfflineAction<T = any> {
    id: string
    type: OfflineActionType
    payload: T
}

export interface OfflineOccurenceQueueRepo {
    getQueue(): Promise<OfflineAction[]>
    saveQueue(queue: OfflineAction[]): Promise<void>
    addAction( type: OfflineActionType, payload: any): Promise<void>
    removeAction(actionId: string): Promise<void>
    clearQueue(): Promise<void>
}

export class OfflineOccurrenceQueuePreferencesRepo implements OfflineOccurenceQueueRepo {

    private QUEUE_KEY = "occurrence_offline_queue"

    async getQueue(): Promise<OfflineAction[]> {
        try {
            const data = await SecureStore.getItemAsync(this.QUEUE_KEY)
            if (!data) return []
            return JSON.parse(data) as OfflineAction[]
        } catch {
            return []
        }
    }

    async saveQueue(queue: OfflineAction[]): Promise<void> {
        await SecureStore.setItemAsync(this.QUEUE_KEY, JSON.stringify(queue))
    }

    async addAction(type: OfflineActionType, payload: any): Promise<void> {
        const queue = await this.getQueue()
        const newAction: OfflineAction = {id: `${Date.now()}-${Math.random()}`, type, payload}
        queue.push(newAction)

        await this.saveQueue(queue)
    }

    async removeAction(actionId: string): Promise<void> {
        const queue = await this.getQueue()
        const updated = queue.filter(a => a.id !== actionId)
        await this.saveQueue(updated)
    }

    async clearQueue(): Promise<void> {
        await SecureStore.deleteItemAsync(this.QUEUE_KEY)
    }
}

export const offlineOccurrenceQueueRepo = new OfflineOccurrenceQueuePreferencesRepo()