import {useAuth} from "../../hooks/useAuth";
import {useRouter} from "expo-router";
import {useEffect} from "react";
import {Text} from "react-native";
import ThemedText from "../ThemedText";

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
            <ThemedText>Loading</ThemedText>
        )
    }

    return children
}

export default UserOnly