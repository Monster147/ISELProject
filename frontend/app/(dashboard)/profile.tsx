import {StyleSheet, Text} from "react-native";
import ThemedText from "../../components/ThemedText";
import ThemedView from "../../components/ThemedView";
import Spacer from "../../components/Spacer";
import {useAuth} from "../../hooks/useAuth";
import ThemedButton from "../../components/ThemedButton";
import {router} from "expo-router";
import React from "react";
import {useAlertExitApp} from "../../hooks/useAlertExitApp";
import {useTranslation} from "react-i18next";

const Profile = () =>{
    const {t} = useTranslation()
    const {logout, token, user} = useAuth()

    useAlertExitApp()

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
                {t("profile.profile")}
            </ThemedText>

            <ThemedText style={styles.heading}>{t("profile.name")}:{user?.name }</ThemedText>
            <ThemedText style={styles.heading}>{t("profile.email")}:{user?.email}</ThemedText>


            <Spacer />

            <ThemedButton onPress={handleLogout}>
                <ThemedText style={{color: '#f2f2f2'}}>{t("profile.logout")}</ThemedText>
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
