import {Animated, StyleSheet, ScrollView} from "react-native";
import ThemedView from "../../../components/ThemedView";
import {Colors} from "@commons/constants/Colors";
import dateFormater from "@commons/utils/dateFormater";
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
import Spacer from "../../../components/Spacer";
import {useType} from "../../../hooks/useType";
import OfflineBanner from "../../../components/ThemedOfflineBanner";

const OccurrenceDetails = () => {
    const {t} = useTranslation()
    const {id} = useLocalSearchParams()
    const router = useRouter();
    const { intervenor } = useIntervenor();

    useBackRedirect(() => router.back())

    const occurrenceId = Number(id)
    const {occurrence} = useOccurrence()
    const actualOccurrence = occurrence.find(o => o.id === occurrenceId);
    const {type} = useType()

    const currentJsonType = type.find(t => t.id === actualOccurrence?.occurrenceType)

    if (!actualOccurrence) {
        return (
            <ThemedView safe={true} style={styles.container}>
                <ThemedLoader/>
            </ThemedView>
        )
    }

    const handleEvidences = async () => {
        router.push(`/occurrences/evidences/${occurrenceId}`)
    };

    const handleIntervenors = async () => {
        router.push(`/occurrences/intervenors/${occurrenceId}`)
    }

    return (
        <ThemedView safe={true} style={styles.container}>
            <ScrollView>
                <ThemedCard style={styles.card}>
                    <ThemedText title={true} style={[styles.title, {alignSelf: "center"}]}>{t("occurrenceDetails.occurrenceDetails")}</ThemedText>

                    <OfflineBanner/>

                    <Spacer/>

                    <ThemedText>{t("occurrenceDetails.initDate")}: {dateFormater(actualOccurrence.initDate)}</ThemedText>

                    <ThemedText>{t("occurrenceDetails.endDate")}: {dateFormater(actualOccurrence.endDate)}</ThemedText>

                    <ThemedText>{t("occurrenceDetails.importance")}: {t(`importance.${actualOccurrence.importance}`)}</ThemedText>

                    <ThemedText>{t("occurrenceDetails.occurrenceType")}: {currentJsonType?.name}</ThemedText>

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
        width: '75%',
        alignSelf: "center",
    },
})