import {StyleSheet, Text} from "react-native";
import ThemedText from "../../../../components/ThemedText";
import ThemedView from "../../../../components/ThemedView";
import Spacer from "../../../../components/Spacer";
import {useAuth} from "../../../hooks/useAuth";
import ThemedButton from "../../../../components/ThemedButton";
import React from "react";
import {useTranslation} from "react-i18next";
import {useConfirmAction} from "../../utils/confirmAction";
import {Colors} from "@commons/constants/Colors";

const Profile = () =>{
    const {t} = useTranslation()
    const {logout, user} = useAuth()
    const confirmAction = useConfirmAction();

    const handleLogout = async () => {
        confirmAction(
            async ()=> await logout(),
            {
                title: t("logout.title"),
                message: t("logout.message"),
                confirmText: t("logout.confirm"),
                cancelText: t("logout.cancel")
            }
        )
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
