import * as SecureStore from 'expo-secure-store'

export type OfflineActionType = "CREATE" | "UPDATE"

export interface OfflineAction<T = any> {
    id: string
    type: OfflineActionType
    payload: T
    retries: number
    maxRetries: number
}

export interface OfflineIntervenorQueueRepo {
    getQueue(): Promise<OfflineAction[]>
    saveQueue(queue: OfflineAction[]): Promise<void>
    addAction( type: OfflineActionType, payload: any): Promise<void>
    removeAction(actionId: string): Promise<void>
    clearQueue(): Promise<void>
    updateAction(actionId: string, updatedAction: OfflineAction): Promise<void>
}

export class OfflineIntervenorQueuePreferencesRepo implements OfflineIntervenorQueueRepo {

    private QUEUE_KEY = "intervenor_offline_queue"

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
        const newAction: OfflineAction = {id: `${Date.now()}-${Math.random()}`, type, payload, retries: 0, maxRetries: 5}
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

    async updateAction(actionId: string, updatedAction: OfflineAction): Promise<void> {
        const queue = await this.getQueue()
        const updated = queue.map(a => a.id === actionId ? updatedAction : a)
        await this.saveQueue(updated)
    }
}

export const offlineIntervenorQueueRepo = new OfflineIntervenorQueuePreferencesRepo()