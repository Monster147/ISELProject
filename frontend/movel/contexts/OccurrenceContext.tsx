import {createContext, useCallback, useEffect, useMemo, useState} from "react";
import {api, ApiError, fetchApi, getAuthHeaders} from "@commons/api/api";
import {authInfoRepo} from "../infrastructure/AuthInfoPreferencesRepo";
import {userInfoRepo} from "../infrastructure/UserInfoPreferencesRepo";
import {Occurrence} from "@commons/models/occurrence/Occurrence";
import {useAuth} from "../hooks/useAuth";
import {useOccurrencesListener, SSEMessage} from "../hooks/useOccurrencesListener";
import {occurrenceInfoRepo} from "../infrastructure/OccurrenceInfoPreferencesRepo";
import {useNetworkStatus} from "../hooks/useNetworkStatus";
import occurrence from "../app/(dashboard)/occurrence";
import {useTranslation} from "react-i18next";
import {offlineOccurrenceQueueRepo} from "../infrastructure/offline/OfflineOccurrenceQueueRepo";
import {offlineIntervenorQueueRepo} from "../infrastructure/offline/OfflineIntervenorQueueRepo";
import {intervenorInfoRepo} from "../infrastructure/IntervenorInfoPreferencesRepo";


type OccurrenceContextValue = {
    listOccurrences: () => Promise<void>;
    occurrence: Occurrence[];
    getOccurrence: (id: number) => Promise<Occurrence>;
    addIntervenorToOccurrence: (intervenorId: number, occurrenceId: number) => Promise<void>;
    removeIntervenorFromOccurrence: (intervenorId: number, occurrenceId: number) => Promise<void>;
    loading: boolean;
};

export const OccurrenceContext = createContext<OccurrenceContextValue | undefined>(undefined)

export function OccurrenceProvider({children}) {
    const [occurrence, setOccurrence] = useState<Occurrence[]>([])
    const [loading, setLoading] = useState(false)
    const { isOnline, shouldResetListeners } = useNetworkStatus()
    const {user} = useAuth()
    const {t} = useTranslation()

    useEffect(() => {
        listOccurrences()
    }, [user, isOnline]);

    const handleOnMessage = useCallback(async (message: SSEMessage) => {
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

    useOccurrencesListener(user?.id, handleOnMessage, isOnline && !shouldResetListeners)

    async function listOccurrences() {
        if (!user) return
        setLoading(true)
        try {
            const response = await api.findOccurrencesByReporterId(user.id)
            setOccurrence(response)
            await occurrenceInfoRepo.saveOccurrenceInfo(response)
        } catch (err: any) {
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

    async function getOccurrence(id: number) {
        try {
            if (!user) return;
            const response = await api.findOccurrenceById(id)
            return response
        } catch (err: any) {
            throw Error(err.message)
        }
    }

    async function addIntervenorToOccurrence(intervenorId: number, occurrenceId: number) {
        if (isOnline) {
            try {
                if (!user) return;
                await api.addIntervenor({intervenorId}, occurrenceId)
                const response = await api.findOccurrencesByReporterId(user.id)
                setOccurrence(response)
            } catch (err: any) {
                throw Error(err.message)
            }
            return;
        } else {
            if (checkIfIntervenorIsInOccurrence(intervenorId, occurrenceId)) throw Error(t("errorResponse.intervenorAlreadyInOccurrence"))
            const intervenors = await intervenorInfoRepo.getIntervenorInfo()
            const intervenor = intervenors?.find(i => i.id === intervenorId)
            if (!intervenor) throw Error(t("errorResponse.intervenorNotFound"))
            const payload = {intervenor: intervenor, occurrenceId: occurrenceId}
            const updated = occurrence.map(o => {
                if (o.id === occurrenceId) {
                    return {...o, intervenors: [...o.intervenors, intervenorId]}
                }
                return o
            })
            setOccurrence(updated)
            await occurrenceInfoRepo.saveOccurrenceInfo(updated)
            await offlineOccurrenceQueueRepo.addAction("ADD_INTERVENOR", payload)
        }
    }

    async function removeIntervenorFromOccurrence(intervenorId: number, occurrenceId: number) {
        if (isOnline) {
            try {
                if (!user) return;
                await api.removeIntervenor({intervenorId}, occurrenceId)
                const response = await api.findOccurrencesByReporterId(user.id)
                setOccurrence(response)
            } catch (err: any) {
                throw Error(err.message)
            }
            return;
        } else {
            const intervenors = await intervenorInfoRepo.getIntervenorInfo()
            const intervenor = intervenors?.find(i => i.id === intervenorId)
            if (!intervenor) throw Error(t("errorResponse.intervenorNotFound"))
            const payload = {intervenor: intervenor, occurrenceId: occurrenceId}
            const updated = occurrence.map(o => {
                if (o.id === occurrenceId) {
                    return {...o, intervenors: o.intervenors.filter(id => id !== intervenorId)}
                }
                return o
            })
            setOccurrence(updated)
            await occurrenceInfoRepo.saveOccurrenceInfo(updated)
            await offlineOccurrenceQueueRepo.addAction("REMOVE_INTERVENOR", payload)
        }
    }

    function checkIfIntervenorIsInOccurrence(intervenorId: number, occurrenceId: number) {
        const occ = occurrence.find(o => o.id === occurrenceId)
        if (!occ) return false
        return occ.intervenors.some(i => i === intervenorId)
    }

    return (
        <OccurrenceContext.Provider value={{occurrence, listOccurrences, getOccurrence, addIntervenorToOccurrence, removeIntervenorFromOccurrence, loading}}>
            {children}
        </OccurrenceContext.Provider>
    )
}