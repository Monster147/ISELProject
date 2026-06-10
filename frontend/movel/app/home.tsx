import {StyleSheet, Image} from "react-native"
import {Link, Redirect} from 'expo-router'
import Logo from '@commons/img/isel.png'
import AppLogo from "@commons/img/logo.png";
import ThemedView from "../components/ThemedView";
import Spacer from "../components/Spacer";
import ThemedText from "../components/ThemedText";
import {useAlertExitApp} from "../hooks/useAlertExitApp";
import {useTranslation} from "react-i18next";
import OfflineBanner from "../components/ThemedOfflineBanner";


const Home = () =>{
    const {t} = useTranslation()

    useAlertExitApp()

    return (
        <ThemedView style={styles.container}>
            <Image source={Logo} style={{ width: 400, height: 200, resizeMode: "cover" }} />
            <Image source={AppLogo} style={{ width: 200, height: 200, resizeMode: "cover" }} />
            <Spacer height={20}/>

            <Spacer height={10}/>
            <ThemedText title={true}> {t("home.appName")} </ThemedText>
            <Spacer/>
            <OfflineBanner/>

            <Link href="/login" style={styles.link}>
                <ThemedText>{t("home.login")}</ThemedText>
            </Link>
            <Link href="/register" style={styles.link}>
                <ThemedText>{t("home.register")}</ThemedText>
            </Link>
            <Link href="/about" style={styles.link}>
                <ThemedText>{t("home.about")}</ThemedText>
            </Link>
            <Link href="/contact" style={styles.link}>
                <ThemedText>{t("home.contact")}</ThemedText>
            </Link>
        </ThemedView>
    )
}

export default Home

const styles = StyleSheet.create({
    container:{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title:{
        fontWeight: 'bold',
        fontSize: 18,
        color: 'purple'
    },
    cart:{
        backgroundColor: '#eee',
        padding: 20,
        borderRadius: 5,
        boxShadow: '4px 4px rgba(0,0,0,0.1)'
    },
    link: {
        marginVertical: 10,
        borderBottomWidth: 1,
    }
})