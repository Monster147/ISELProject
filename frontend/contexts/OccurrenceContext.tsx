import {createContext, useEffect, useMemo, useState} from "react";
import {api, ApiError, fetchApi, getAuthHeaders} from "../api/api";
import {authInfoRepo} from "../infrastructure/AuthInfoPreferencesRepo";
import {User} from "../models/user/User";
import {userInfoRepo} from "../infrastructure/UserInfoPreferencesRepo";
import { Occurrence } from "../models/occurrence/Occurrence";
import {useAuth} from "../hooks/useAuth";


type OccurrenceContextValue = {
    listOccurrences: () => Promise<void>;
    occurrence: Occurrence[];
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

    return (
        <OccurrenceContext.Provider value={{occurrence, listOccurrences}}>
            {children}
        </OccurrenceContext.Provider>
    )
}