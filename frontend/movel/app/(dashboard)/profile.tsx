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
import {confirmAction} from "../../utils/confirmAction";
import {Colors} from "@commons/constants/Colors";
import OfflineBanner from "../../components/ThemedOfflineBanner";

const Profile = () =>{
    const {t} = useTranslation()
    const {logout, token, user} = useAuth()

    useAlertExitApp()

    const handleLogout = async () => {
        confirmAction(
            {
                title: t("logout.title"),
                message: t("logout.message"),
                confirmText: t("logout.confirm"),
                cancelText: t("logout.cancel")
            },
            async ()=> await logout()
        )
    };

    return(
        <ThemedView style={styles.container} safe={true}>
            <Spacer />
            <ThemedText title={true} style={styles.heading}>
                {t("profile.profile")}
            </ThemedText>
            <OfflineBanner/>

            <ThemedText style={styles.heading}>{t("profile.name")}:{user?.name }</ThemedText>
            <ThemedText style={styles.heading}>{t("profile.email")}:{user?.email}</ThemedText>


            <Spacer />

            <ThemedButton onPress={handleLogout} style={styles.logoutButton}>
                <ThemedText style={{color: '#f2f2f2', textAlign: 'center'}}>{t("profile.logout")}</ThemedText>
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
    },
    logoutButton: {
        marginTop: 40,
        backgroundColor: Colors.warning,
        width: 200,
        alignSelf: "center",
    },
})
