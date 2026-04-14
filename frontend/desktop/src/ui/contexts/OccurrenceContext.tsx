import {createContext, useEffect, useMemo, useState} from "react";
import {api, ApiError, fetchApi, getAuthHeaders} from "@commons/api/api";
import { Occurrence } from "@commons/models/occurrence/Occurrence";
import {useAuth} from "../../hooks/useAuth";


type OccurrenceContextValue = {
    listOccurrences: () => Promise<void>;
    occurrence: Occurrence[];
    getOccurrence: (id:number) => Promise<Occurrence>;
    addIntervenorToOccurrence: (intervenorId: number, occurrenceId: number) => Promise<void>;
    removeIntervenorFromOccurrence: (intervenorId: number, occurrenceId: number) => Promise<void>;
};

export const OccurrenceContext = createContext<OccurrenceContextValue | undefined>(undefined)

export function OccurrenceProvider({children}) {
    const [occurrence, setOccurrence] = useState<Occurrence[]>([])
    const {user} = useAuth()

    useEffect(() => {
        if (user){
            listOccurrences()
        } else {
            setOccurrence([])
        }
    }, [user]);

    async function listOccurrences() {
        try {
            if (!user) return;
            const response = await api.findOccurrencesByReporterId(user.id)
            setOccurrence(response)
        }catch (err: any) {
            throw Error(err.message)
        }
    }

    async function getOccurrence(id:number){
        try {
            if (!user) return;
            const response = await api.findOccurrenceById(id)
            return response
        }catch (err: any) {
            throw Error(err.message)
        }
    }

    async function addIntervenorToOccurrence(intervenorId: number, occurrenceId: number){
        try {
            if (!user) return;
            await api.addIntervenor(intervenorId, occurrenceId)
            const response = await api.findOccurrencesByReporterId(user.id)
            setOccurrence(response)
        }catch (err: any) {
            throw Error(err.message)
        }
    }

    async function removeIntervenorFromOccurrence(intervenorId: number, occurrenceId: number){
        try {
            if (!user) return;
            await api.removeIntervenor(intervenorId, occurrenceId)
            const response = await api.findOccurrencesByReporterId(user.id)
            setOccurrence(response)
        }catch (err: any) {
            throw Error(err.message)
        }
    }

    return (
        <OccurrenceContext.Provider value={{occurrence, listOccurrences, getOccurrence, addIntervenorToOccurrence, removeIntervenorFromOccurrence}}>
            {children}
        </OccurrenceContext.Provider>
    )
}