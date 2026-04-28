import {createContext} from "react";
import {Json} from "@commons/models/utils/Json";
import {api} from "@commons/api/api";


type EvidenceContextValue = {
    createEvidence: (type: Json, location: string, description: string, reporterId: number, reportId: number) => Promise<any>
    findEvidenceById: (id: number) => Promise<any>
}

export const EvidenceContext = createContext<EvidenceContextValue | undefined>(undefined)

export function EvidenceProvider({children}) {

    async function createEvidence(type: Json, location: string, description: string, reporterId: number, reportId: number){
        try {
            await api.createEvidence({type, location, description, reporterId, reportId})
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