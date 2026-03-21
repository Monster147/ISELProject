import {createContext, useState} from "react";

export const AuthContext = createContext()

export function AuthProvider({children}) {
    const [token, setToken] =  useState(null)

    async function login(email, password){

    }


    async function register(email, password) {

    }


    async function logout(email, password){

    }
    return (
        <AuthContext value={{login, register, logout, token}}>
            {children}
        </AuthContext>
    )
}