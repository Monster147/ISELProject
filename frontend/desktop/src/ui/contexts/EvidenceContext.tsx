import {createContext} from "react";
import {Json} from "@commons/models/utils/Json";
import {api} from "@commons/api/api";
import {UploadFile} from "@commons/models/utils/UploadFile";

type EvidenceContextValue = {
    createEvidence: (file: UploadFile, type: string, location: string, description: string, reporterId: number, occurrenceId: number) => Promise<any>
    findEvidenceById: (id: number) => Promise<any>
}

export const EvidenceContext = createContext<EvidenceContextValue | undefined>(undefined)

export function EvidenceProvider({children}) {

    async function createEvidence(file: UploadFile, type: string, location: string, description: string, reporterId: number, occurrenceId: number){
        try {
            await api.createEvidence(file, {type, location, description, reporterId, occurrenceId})
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

    return (
        <EvidenceContext.Provider value={{createEvidence, findEvidenceById}}>
            {children}
        </EvidenceContext.Provider>
    )
}