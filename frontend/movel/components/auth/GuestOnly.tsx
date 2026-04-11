import {useAuth} from "../../hooks/useAuth";
import {useRouter} from "expo-router";
import {useEffect} from "react";
import ThemedLoader from "../ThemedLoader";

const GuestOnly = ({children}) =>{
    const {token, isAuthLoading} = useAuth()
    const router = useRouter()

    useEffect(()=> {
        if (isAuthLoading) return
        if (token !== null) {
            router.replace("/occurrence")
        }
    }, [token, isAuthLoading])

    if (isAuthLoading || token) {
        return (
            <ThemedLoader/>
        )
    }

    return children
}

export default GuestOnly