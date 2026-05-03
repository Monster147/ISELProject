import {createContext, useCallback, useEffect, useMemo, useState} from "react";
import {api, ApiError, fetchApi, getAuthHeaders} from "@commons/api/api";
import {authInfoRepo} from "../infrastructure/AuthInfoPreferencesRepo";
import {userInfoRepo} from "../infrastructure/UserInfoPreferencesRepo";
import { Occurrence } from "@commons/models/occurrence/Occurrence";
import {useAuth} from "../hooks/useAuth";
import {useOccurrencesListener, SSEMessage} from "../hooks/useOccurrencesListener";
import {occurrenceInfoRepo} from "../infrastructure/OccurrenceInfoPreferencesRepo";
import {useNetworkStatus} from "../hooks/useNetworkStatus";


type OccurrenceContextValue = {
    listOccurrences: () => Promise<void>;
    occurrence: Occurrence[];
    getOccurrence: (id:number) => Promise<Occurrence>;
    addIntervenorToOccurrence: (intervenorId: number, occurrenceId: number) => Promise<void>;
    removeIntervenorFromOccurrence: (intervenorId: number, occurrenceId: number) => Promise<void>;
    loading: boolean;
};

export const OccurrenceContext = createContext<OccurrenceContextValue | undefined>(undefined)

export function OccurrenceProvider({children}) {
    const [occurrence, setOccurrence] = useState<Occurrence[]>([])
    const [loading, setLoading] = useState(false)
    const { isOnline } = useNetworkStatus()
    const {user} = useAuth()

    useEffect(() => {
        listOccurrences()
    }, [user, isOnline]);

    const handleOnMessage = useCallback( async (message: SSEMessage)=>{
        setLoading(true)
        const data = message.data
        const action = message.action
        switch (action) {
            case "OccurrencesChanged":
                setOccurrence(data.occurrences)
                await occurrenceInfoRepo.saveOccurrenceInfo(data.occurrences)
                break
            default:
                break
        }
        setTimeout(() => setLoading(false), 300);
    }, [])

    useOccurrencesListener(user?.id, handleOnMessage, isOnline)

    async function listOccurrences() {
        if (!user) return
        setLoading(true)
        try {
            const response = await api.findOccurrencesByReporterId(user.id)
            setOccurrence(response)
            await occurrenceInfoRepo.saveOccurrenceInfo(response)
        }catch (err: any) {
            const cached = await occurrenceInfoRepo.getOccurrenceInfo()
            if (cached) {
                setOccurrence(cached)
            } else {
                setOccurrence([])
            }
        } finally {
            setLoading(false)
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
            await api.addIntervenor({intervenorId}, occurrenceId)
            const response = await api.findOccurrencesByReporterId(user.id)
            setOccurrence(response)
        }catch (err: any) {
            throw Error(err.message)
        }
    }

    async function removeIntervenorFromOccurrence(intervenorId: number, occurrenceId: number){
        try {
            if (!user) return;
            await api.removeIntervenor({intervenorId}, occurrenceId)
            const response = await api.findOccurrencesByReporterId(user.id)
            setOccurrence(response)
        }catch (err: any) {
            throw Error(err.message)
        }
    }

    return (
        <OccurrenceContext.Provider value={{occurrence, listOccurrences, getOccurrence, addIntervenorToOccurrence, removeIntervenorFromOccurrence, loading}}>
            {children}
        </OccurrenceContext.Provider>
    )
}