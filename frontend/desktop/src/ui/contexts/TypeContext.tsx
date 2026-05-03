import {createContext, useCallback, useEffect, useState} from "react";
import {Type} from "@commons/models/type/Type";
import {api} from "@commons/api/api";
import {useAuth} from "../../hooks/useAuth";
import {useTypesListener, SSEMessage} from "../../../hooks/useTypesListener";
import {useNetworkStatus} from "../../hooks/useNetworkStatus";

type TypeContextValue={
    type: Type[]
    findAllTypes: ()=>Promise<any>
    loading: boolean
}

export const TypeContext = createContext<TypeContextValue | undefined>(undefined)

export const TypeProvider = ({children})=> {
    const [type, setType]= useState<Type[]>([])
    const {user}= useAuth()
    const [loading, setLoading] = useState(false)
    const { isOnline } = useNetworkStatus()

    useEffect(() => {
        findAllTypes()
    }, [user, isOnline]);

    const handleOnMessage = useCallback((message: SSEMessage) => {
        setLoading(true)
        const data = message.data
        const action = message.action
        switch (action) {
            case "TypesChanged":
                setType(data.types)
                break
            default:
                break
        }
        setTimeout(() => setLoading(false), 300);
    }, [])

    useTypesListener(handleOnMessage, isOnline)

    async function findAllTypes(){
        try {
            const response = await api.findAllTypes()
            setType(response)
        }catch (err: any) {
            throw Error(err.message)
        }
    }


    return(
        <TypeContext.Provider value={{type, findAllTypes, loading}}>
            {children}
        </TypeContext.Provider>
    )


}
