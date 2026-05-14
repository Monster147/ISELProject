import {createContext} from "react";
import {Json} from "@commons/models/utils/Json";
import {api} from "@commons/api/api";
import {UploadFile} from "@commons/models/utils/UploadFile";
import {useNetworkStatus} from "../../hooks/useNetworkStatus";

type EvidenceContextValue = {
    createEvidence: (file: UploadFile, type: string, location: string, description: string, reporterId: number, occurrenceId: number) => Promise<any>
    findEvidenceById: (id: number) => Promise<any>
    findEvidenceByOccurrenceId: (occurrenceId: number) => Promise<any>
    downloadEvidence: (evidenceId: number) => Promise<any>
    deleteEvidence: (evidenceId: number) => Promise<any>
}

export const EvidenceContext = createContext<EvidenceContextValue | undefined>(undefined)

export function EvidenceProvider({children}) {
    async function createEvidence(file: UploadFile, type: string, location: string, description: string, reporterId: number, occurrenceId: number){
        try {
            const response = await api.createEvidence(file, {type, location, description, reporterId, occurrenceId})
            return response
        } catch (err: any) {
            throw Error(err.message)
        }
    }

    async function findEvidenceById(id:number){
        try {
            const response= await api.findEvidenceById(id)
            return response
        } catch (err: any) {
            throw Error(err.message)
        }
    }

    async function findEvidenceByOccurrenceId(occurrenceId:number){
        try{
            const response = await api.findEvidenceByOccurrenceId(occurrenceId)
            return response
        } catch (err: any) {
            throw Error(err.message)
        }
    }

    async function downloadEvidence(evidenceId:number){
        try{
            const response = await api.downloadEvidence(evidenceId)
            return response
        } catch (err: any) {
            throw Error(err.message)
        }
    }

    async function deleteEvidence(evidenceId:number){
        try{
            await api.deleteEvidence(evidenceId)
        } catch (err: any) {
            throw Error(err.message)
        }
    }

    return (
        <EvidenceContext.Provider value={{createEvidence, findEvidenceById, findEvidenceByOccurrenceId, downloadEvidence, deleteEvidence}}>
            {children}
        </EvidenceContext.Provider>
    )
}