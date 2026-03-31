import {createContext, useEffect, useMemo, useState} from "react";
import {api, ApiError, fetchApi, getAuthHeaders} from "../api/api";
import {authInfoRepo} from "../infrastructure/AuthInfoPreferencesRepo";
import {User} from "../models/user/User";
import {userInfoRepo} from "../infrastructure/UserInfoPreferencesRepo";

type AuthContextValue = {
    token: string | null;
    isAuthLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    user: User | null;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({children}) {
    const [token, setToken] = useState<string | null>(null)
    const [user, setUser] = useState<User| null>(null)
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const info = await authInfoRepo.getAuthInfo();
                const user = await userInfoRepo.getUserInfo();
                if (cancelled) return;
                setToken(info?.token ?? null);
                setUser(user ?? null)
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
            const user = await api.userHome()
            await userInfoRepo.saveUserInfo(user)
            setUser(user)
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
            const user = await api.userHome()
            await userInfoRepo.saveUserInfo(user)
            setUser(user)
        } catch (err: any) {
            throw Error(err.message)
        }
    }

    async function logout(){
        try {
            await api.logout()
            await authInfoRepo.clearAuthInfo()
            setToken(null)
            await userInfoRepo.clearUserInfo()
            setUser(null)
        } catch (err: any) {
            throw Error(err.message)
        }
    }
    return (
        <AuthContext.Provider value={{login, register, logout, token, isAuthLoading, user}}>
            {children}
        </AuthContext.Provider>
    )
}