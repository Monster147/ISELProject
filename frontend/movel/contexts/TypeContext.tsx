import {createContext, useEffect, useState} from "react";
import {Type} from "@commons/models/type/Type";
import {api} from "@commons/api/api";
import {useAuth} from "../hooks/useAuth";

type TypeContextValue={
    type: Type[]
    findAllTypes: ()=>Promise<any>
}

export const TypeContext = createContext<TypeContextValue | undefined>(undefined)

export const TypeProvider = ({children})=> {
    const [type, setType]= useState<Type[]>([])
    const {user}= useAuth()

    useEffect(() => {
        findAllTypes()
    }, [user]);

    async function findAllTypes(){
        try {
            const response = await api.findAllTypes()
            setType(response)
        }catch (err: any) {
            throw Error(err.message)
        }
    }


    return(
        <TypeContext.Provider value={{type, findAllTypes}}>
            {children}
        </TypeContext.Provider>
    )


}
