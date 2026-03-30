import {createContext, useEffect, useMemo, useState} from "react";
import {api, ApiError, fetchApi, getAuthHeaders} from "../api/api";
import {authInfoRepo} from "../infrastructure/AuthInfoPreferencesRepo";
import {User} from "../models/user/User";

type OccurrenceContextValue = {
    token: string | null;
    isAuthLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

export const OccurrenceContext = createContext<OccurrenceContextValue | undefined>(undefined)

export function OccurrenceProvider({children}) {
    const [token, setToken] = useState<string | null>(null)
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const info = await authInfoRepo.getAuthInfo();
                if (cancelled) return;
                setToken(info?.token ?? null);
            } finally {
                if (!cancelled) setIsAuthLoading(false);
            }
        })();

        return () => {
            cancelled = true
        };
    }, []);

    async function login(email: string, password: string){
        try {
            const response = await api.createToken({email, password})
            await authInfoRepo.saveAuthInfo({ token: response.token })
            setToken(response.token)
        } catch (err : any) {
            throw Error(err.message)
        }
    }

    async function register(name: string,email : string, password: string) {
        try {
            await api.createUser({name, email, password})
            const response = await api.createToken({email, password})
            await authInfoRepo.saveAuthInfo({ token: response.token })
            setToken(response.token)
        } catch (err: any) {
            throw Error(err.message)
        }
    }

    async function logout(){
        try {
            await api.logout()
            await authInfoRepo.clearAuthInfo()
            setToken(null)
        } catch (err: any) {
            throw Error(err.message)
        }
    }
    return (
        <OccurrenceContext.Provider value={{login, register, logout, token, isAuthLoading}}>
            {children}
        </OccurrenceContext.Provider>
    )
}