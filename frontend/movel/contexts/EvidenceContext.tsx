import {createContext, useCallback, useEffect, useState} from "react";
import {api} from "@commons/api/api";
import {UploadFile} from "@commons/models/utils/UploadFile";
import {useNetworkStatus} from "../hooks/useNetworkStatus";
import {offlineEvidenceQueueRepo} from "../infrastructure/offline/OfflineEvidenceQueueRepo";
import {Evidence} from "@commons/models/evidence/Evidence";
import {useAuth} from "../hooks/useAuth";
import {useEvidenceListener, SSEMessage} from "../hooks/useEvidenceListener";
import {evidenceInfoRepo} from "../infrastructure/EvidenceInfoPreferencesRepo";
import ReactNativeBlobUtil from "react-native-blob-util";

type EvidenceContextValue = {
    createEvidence: (file: UploadFile, type: string, location: string, description: string, reporterId: number, occurrenceId: number) => Promise<any>
    findEvidenceById: (id: number) => Promise<any>
    findEvidenceByOccurrenceId: (occurrenceId: number) => Promise<any>
    downloadEvidence: (evidenceId: number, keep: boolean) => Promise<any>
    deleteEvidence: (evidenceId: number) => Promise<any>
    updateEvidence: (file: UploadFile, evidenceId: number) => Promise<any>
}

export const EvidenceContext = createContext<EvidenceContextValue | undefined>(undefined)

export function EvidenceProvider({children}) {
    const [evidence, setEvidence] = useState<Evidence[]>([])
    const {user} = useAuth()
    const { isOnline, shouldResetListeners } = useNetworkStatus()

    useEffect(() => {
        loadEvidences()
    }, [isOnline, user]);

    const handleOnMessage = useCallback(async (message: SSEMessage) => {
        const data = message.data
        const action = message.action
        switch (action) {
            case "EvidenceCreated":
                setEvidence(data.evidences)
                await evidenceInfoRepo.saveEvidenceInfo(data.evidences)
                break
            case "EvidenceDeleted":
                setEvidence(data.evidences)
                await evidenceInfoRepo.saveEvidenceInfo(data.evidences)
                break
            case "EvidenceUpdated":
                setEvidence(data.evidences)
                await evidenceInfoRepo.saveEvidenceInfo(data.evidences)
                break
            default:
                break
        }
    }, [])

    useEvidenceListener(user?.id, handleOnMessage, isOnline && !shouldResetListeners)

    async function loadEvidences(){
        try {
            const response = await api.findEvidenceByReporterId(user?.id as number)
            setEvidence(response)
            await evidenceInfoRepo.saveEvidenceInfo(response)
        } catch (err: any) {
            const cached = await evidenceInfoRepo.getEvidenceInfo()
            if (cached) {
                setEvidence(cached)
            } else {
                setEvidence([])
            }
        }
    }

    async function createEvidence(file: UploadFile, type: string, location: string, description: string, reporterId: number, occurrenceId: number){
        if (isOnline) {
            try {
                const result = await api.createEvidence(file, {type, location, description, reporterId, occurrenceId})
               await loadEvidences()
                return result
            } catch (err: any) {
                throw Error(err.message)
            }
        }
        else {
            const tempId = Date.now()
            const payload = {id: tempId, type, filePath: file.name, location, description, reporterId, reportId: occurrenceId, createdAt: tempId, updatedAt: tempId }
            const updated = [...evidence, payload as Evidence]
            setEvidence(updated)
            await evidenceInfoRepo.saveEvidenceInfo(updated)
            await offlineEvidenceQueueRepo.addAction("CREATE", {file, type, location, description, reporterId, occurrenceId, evidenceId: tempId})
            return { id: tempId, filePath: file.name }
        }
    }

    async function findEvidenceById(id:number){
        if(isOnline){
            try {
                const response= await api.findEvidenceById(id)
                return response
            } catch (err: any) {
                throw Error(err.message)
            }
        } else {
            const cached = await evidenceInfoRepo.getEvidenceInfo()
            if (cached) {
                return cached.find(e => e.id === id)
            }
        }
    }

    async function findEvidenceByOccurrenceId(occurrenceId:number){
        if(isOnline){
            try{
                const response = await api.findEvidenceByOccurrenceId(occurrenceId)
                return response
            } catch (err: any) {
                throw Error(err.message)
            }
        } else{
            const filtered = evidence.filter(e => e.reportId === occurrenceId)
            return filtered
        }
    }

    async function downloadEvidence(evidenceId:number, keep: boolean){
        if (isOnline){
            try{
                const response = await api.downloadEvidence(evidenceId, keep)
                return response
            } catch (err: any) {
                throw Error(err.message)
            }
        } else {
            const cached = await evidenceInfoRepo.getEvidenceInfo()
            const evidence = cached?.find(e => e.id === evidenceId)

            if (evidence && evidence.filePath) {
                const cacheDir = ReactNativeBlobUtil.fs.dirs.CacheDir;
                const localPath = `${cacheDir}/${evidence.filePath}`;

                const fileExists = await ReactNativeBlobUtil.fs.exists(localPath);

                if (fileExists) {
                    return {
                        path: () => localPath,
                        text: async () => {
                            const content = await ReactNativeBlobUtil.fs.readFile(localPath, 'utf8');
                            return content;
                        },
                        respInfo: {
                            headers: {
                                'content-type': evidence.filePath.endsWith('.json')
                                    ? 'application/json'
                                    : 'application/octet-stream'
                            }
                        },
                        flush: async () => {}
                    };
                }
            }
        }
    }

    async function deleteEvidence(evidenceId:number){
        if(isOnline){
            try{
                await api.deleteEvidence(evidenceId)
                await loadEvidences()
            } catch (err: any) {
                throw Error(err.message)
            }
        }
        else{
            const queue = await offlineEvidenceQueueRepo.getQueue()
            const createAction = queue.find(a =>
                a.type === "CREATE" &&
                a.payload.evidenceId === evidenceId
            )

            if (createAction) {
                await offlineEvidenceQueueRepo.removeAction(createAction.id)
            } else {
                await offlineEvidenceQueueRepo.addAction("DELETE", {evidenceId})
            }

            const updated = evidence.filter(e => e.id !== evidenceId)
            setEvidence(updated)
            await evidenceInfoRepo.saveEvidenceInfo(updated)
        }
    }

    async function updateEvidence(file: UploadFile, evidenceId: number){
        if(isOnline){
            try {
                const response = await api.updateEvidence(file, evidenceId)
                return response
            } catch (err: any) {
                throw Error(err.message)
            }
        } else{
            const queue = await offlineEvidenceQueueRepo.getQueue()

            const createAction = queue.find(a =>
                a.type === "CREATE" &&
                a.payload.evidenceId === evidenceId
            )

            if (createAction) {
                const updatedCreateAction = {
                    ...createAction,
                    payload: {
                        ...createAction.payload,
                        file: file,
                    }
                }
                await offlineEvidenceQueueRepo.updateAction(createAction.id, updatedCreateAction)
            } else {
                await offlineEvidenceQueueRepo.addAction("UPDATE", {file, evidenceId})
            }

            const updated = evidence.map(e => {
                if (e.id === evidenceId) {
                    return {
                        ...e,
                        filePath: file.name,
                        updatedAt: Date.now()
                    }
                }
                return e
            })

            setEvidence(updated)
            await evidenceInfoRepo.saveEvidenceInfo(updated)
            return { id: evidenceId, filePath: file.name }
        }
    }

    return (
        <EvidenceContext.Provider value={{createEvidence, findEvidenceById, findEvidenceByOccurrenceId, downloadEvidence, deleteEvidence, updateEvidence}}>
            {children}
        </EvidenceContext.Provider>
    )
}