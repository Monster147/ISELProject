import {Animated, StyleSheet, ScrollView} from "react-native";
import ThemedView from "../../../components/ThemedView";
import {Colors} from "@commons/constants/Colors";
import ThemedText from "../../../components/ThemedText";
import {useLocalSearchParams, useRouter} from "expo-router";
import {useOccurrence} from "../../../hooks/useOccurrence";
import {useEffect, useState} from "react";
import ThemedCard from "../../../components/ThemedCard";
import ThemedLoader from "../../../components/ThemedLoader";
import ThemedButton from "../../../components/ThemedButton";
import {useBackRedirect} from "../../../hooks/useBackRedirect";
import {useIntervenor} from "../../../hooks/useIntervenor";
import {useTranslation} from "react-i18next";

const OccurrenceDetails = () => {
    const {t} = useTranslation()
    const {id} = useLocalSearchParams()
    const router = useRouter();
    const { intervenor } = useIntervenor();

    useBackRedirect("/occurrence")

    //const [currentOccurrence, setCurrentOccurrence] = useState<Occurrence|null>(null);
    //const {getOccurrence} = useOccurrence()

    const occurrenceId = Number(id)
    const {occurrence} = useOccurrence()
    const actualOccurrence = occurrence.find(o => o.id === occurrenceId);

    /*
    useEffect(() => {
        async function loadOccurrence(){
            const occurrenceData= await getOccurrence(idNumber)
            setCurrentOccurrence(occurrenceData)
        }

        loadOccurrence()
    }, [id])
     */

    if (!actualOccurrence) {
        return (
            <ThemedView safe={true} style={styles.container}>
                <ThemedLoader/>
            </ThemedView>
        )
    }

    const handleEvidences = async () => {
        console.log("Navegar Evidencias")
    };

    const handleIntervenors = async () => {
        router.push(`/occurrences/intervenors/${occurrenceId}`)
    }

    return (
        <ThemedView safe={true} style={styles.container}>
            <ScrollView>
                <ThemedCard style={styles.card}>
                    <ThemedText title={true} style={styles.title}>{t("occurrenceDetails.occurrenceDetails")}</ThemedText>

                    <ThemedText>{t("occurrenceDetails.initDate")}: {actualOccurrence.initDate}</ThemedText>

                    <ThemedText>{t("occurrenceDetails.endDate")}: {actualOccurrence.endDate}</ThemedText>

                    <ThemedText>{t("occurrenceDetails.importance")}: {t(`importance.${actualOccurrence.importance}`)}</ThemedText>

                    <ThemedText>{t("occurrenceDetails.occurrenceType")}:</ThemedText>
                    <ThemedText>{JSON.stringify(actualOccurrence.occurrenceType, null, 2)}</ThemedText>

                    <ThemedText>{t("occurrenceDetails.occurrenceInfo")}:</ThemedText>
                    <ThemedText>{JSON.stringify(actualOccurrence.occurrenceInfo, null, 2)}</ThemedText>
                    <ThemedButton onPress={handleEvidences} style={styles.create}>
                        <ThemedText style={{color: '#fff', textAlign: 'center'}}>{t("occurrenceDetails.goEvidences")}</ThemedText>
                    </ThemedButton>
                    <ThemedButton onPress={handleIntervenors} style={styles.create}>
                        <ThemedText style={{color: '#fff', textAlign: 'center'}}>{t("occurrenceDetails.seeIntervenors")}</ThemedText>
                    </ThemedButton>
                </ThemedCard>
            </ScrollView>
        </ThemedView>

    )
}

export default OccurrenceDetails

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "stretch",
    },
    title: {
        fontSize: 22,
        marginVertical: 10,
    },
    card: {
        margin: 20
    },
    create: {
        marginTop: 40,
        backgroundColor: Colors.success,
        width: 200,
        alignSelf: "center",
    },
})