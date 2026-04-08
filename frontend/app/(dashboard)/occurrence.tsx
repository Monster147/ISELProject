import {FlatList, Pressable, StyleSheet} from "react-native";
import ThemedText from "../../components/ThemedText";
import ThemedView from "../../components/ThemedView";
import Spacer from "../../components/Spacer";
import {useOccurrence} from "../../hooks/useOccurrence";
import {useAuth} from "../../hooks/useAuth";
import {useEffect} from "react";
import {Colors} from "../../constants/Colors";
import ThemedCard from "../../components/ThemedCard";
import {useRouter} from "expo-router";
import {useAlertExitApp} from "../../hooks/useAlertExitApp";
import {useTranslation} from "react-i18next";

const Occurrence = () =>{
    const {t} = useTranslation()
    const {occurrence} = useOccurrence()
    const router = useRouter()

    useAlertExitApp()

    return(
        <ThemedView style={styles.container} safe={true}>
            <Spacer />
            <ThemedText title={true} style={styles.heading}>
                {t("occurrence.occurrenceList")}
            </ThemedText>

            <Spacer />

            <FlatList
                data={occurrence}
                keyExtractor={(item)=> item.id.toString()}
                contentContainerStyle={styles.list}
                renderItem={({item}) =>(
                    <Pressable onPress={()=> router.push(`/occurrences/${item.id}`)}>
                        <ThemedCard style={styles.card}>
                            <ThemedText style={styles.title}>{t("occurrence.initDate")}:{item.initDate}</ThemedText>
                            <ThemedText style={styles.title}>{t("occurrence.endDate")}:{item.endDate}</ThemedText>
                            <ThemedText style={styles.title}>{t("occurrence.importance")}:{item.importance}</ThemedText>
                        </ThemedCard>
                    </Pressable>
                )}

            />

        </ThemedView>
    )
}

export default Occurrence

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
    list: {
        marginTop: 40,
        paddingBottom: 20,
    },
    card: {
        width: "90%",
        marginHorizontal: "5%",
        marginVertical: 10,
        padding: 10,
        paddingLeft: 14,
        borderLeftColor: Colors.primary,
        borderLeftWidth: 4
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
})