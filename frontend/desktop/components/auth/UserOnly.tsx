import {useAuth} from "../../src/hooks/useAuth";
import {useNavigate} from "react-router";
import {useEffect} from "react";
import ThemedLoader from "../ThemedLoader";

const UserOnly = ({children}) =>{
    const {token, isAuthLoading} = useAuth()
    const navigate = useNavigate()

    useEffect(()=> {
        if (isAuthLoading) return
        if (!token) {
            navigate("/login")
        }
    }, [token, isAuthLoading])

    if (isAuthLoading || !token) {
        return (
            <ThemedLoader/>
        )
    }

    return children
}

export default UserOnly