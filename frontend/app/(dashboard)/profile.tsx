import {StyleSheet, Text} from "react-native";
import ThemedText from "../../components/ThemedText";
import ThemedView from "../../components/ThemedView";
import Spacer from "../../components/Spacer";
import {useAuth} from "../../hooks/useAuth";
import ThemedButton from "../../components/ThemedButton";
import {router} from "expo-router";
import React from "react";

const Profile = () =>{
    const {logout, token, user} = useAuth()

    const handleLogout = async () => {
        console.log(user)
        console.log(token)
        await logout();
        console.log(user)
        console.log(token)
    };

    return(
        <ThemedView style={styles.container} safe={true}>
            <Spacer />
            <ThemedText title={true} style={styles.heading}>
                Your Profile
            </ThemedText>

            <ThemedText style={styles.heading}>Name:{user?.name }</ThemedText>
            <ThemedText style={styles.heading}>Email:{user?.email}</ThemedText>


            <Spacer />

            <ThemedButton onPress={handleLogout}>
                <Text style={{color: '#f2f2f2'}}>Logout</Text>
            </ThemedButton>

        </ThemedView>
    )
}

export default Profile

const styles = StyleSheet.create({
    container:{
        flex: 1,
        alignItems: 'stretch',
    },
    heading:{
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center'
    }
})
