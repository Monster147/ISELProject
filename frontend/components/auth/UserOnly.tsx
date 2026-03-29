import {useAuth} from "../../hooks/useAuth";
import {useRouter} from "expo-router";
import {useEffect} from "react";
import {Text} from "react-native";
import ThemedText from "../ThemedText";
import ThemedLoader from "../ThemedLoader";

const UserOnly = ({children}) =>{
    const {token} = useAuth()
    const router = useRouter()

    useEffect(()=> {
        if (!token) {
            router.replace("/login")
        }
    }, [token])

    if(!token){
        return (
            <ThemedLoader/>
        )
    }

    return children
}

export default UserOnly