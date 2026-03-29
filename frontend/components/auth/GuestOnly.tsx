import {useAuth} from "../../hooks/useAuth";
import {useRouter} from "expo-router";
import {useEffect} from "react";
import {Text} from "react-native";
import ThemedText from "../ThemedText";
import ThemedLoader from "../ThemedLoader";

const GuestOnly = ({children}) =>{
    const {token} = useAuth()
    const router = useRouter()

    useEffect(()=> {
        if (token !== null) {
            router.replace("/profile")
        }
    }, [token])

    if(token){
        return (
            <ThemedLoader/>
        )
    }

    return children
}

export default GuestOnly