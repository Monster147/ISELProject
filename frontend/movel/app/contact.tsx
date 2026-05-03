import {StyleSheet, Text, View} from "react-native";
import {Link, router} from 'expo-router'
import ThemedView from "../components/ThemedView";
import ThemedText from "../components/ThemedText";
import {useBackRedirect} from "../hooks/useBackRedirect";
import OfflineBanner from "../components/ThemedOfflineBanner";

const Contact = () =>{

    useBackRedirect(() => router.navigate(`/home`))

    return(
        <ThemedView style={styles.container}>
            <ThemedText style={styles.title} title={true}>Contact Page</ThemedText>
            <OfflineBanner/>
        </ThemedView>
    )
}

export default Contact

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
    link: {
        marginVertical: 10,
        borderBottomWidth: 1,
    }
})