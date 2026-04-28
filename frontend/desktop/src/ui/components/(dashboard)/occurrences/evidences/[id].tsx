import {StyleSheet, ScrollView} from "react-native";
import {useTranslation} from "react-i18next";
import {useNavigate, useParams} from "react-router";

import ThemedView from "../../../../../../components/ThemedView";
import ThemedText from "../../../../../../components/ThemedText";
import ThemedCard from "../../../../../../components/ThemedCard";
import ThemedLoader from "../../../../../../components/ThemedLoader";
import Spacer from "../../../../../../components/Spacer";
import {Colors} from "@commons/constants/Colors";

import {useOccurrence} from "../../../../../hooks/useOccurrence";
import {useType} from "../../../../../hooks/useType";

const OccurrenceEvidences = () => {
    const {t} = useTranslation();
    const {occurrenceId} = useParams();
    const navigate = useNavigate();

    const id = Number(occurrenceId);

    const {occurrence} = useOccurrence();
    const {type} = useType();

    const actualOccurrence = occurrence.find(o => o.id === id);

    if (!actualOccurrence) {
        return (
            <ThemedView safe={true} style={styles.container}>
                <ThemedLoader />
            </ThemedView>
        );
    }

    const currentType = type.find(tp => tp.id === actualOccurrence.occurrenceType);

    const existingEvidenceIds = actualOccurrence.evidence ?? [];

    return (
        <ThemedView safe={true} style={styles.container}>
            <ScrollView>
                <ThemedCard style={styles.card}>
                    <ThemedText title={true} style={[styles.title, {alignSelf: "center"}]}>
                        {t("occurrenceEvidences.title", { defaultValue: "Evidências da Ocorrência" })}
                    </ThemedText>

                    <Spacer />

                    <ThemedText>
                        {t("occurrenceEvidences.required", { defaultValue: "Evidências necessárias:" })}
                    </ThemedText>

                    <Spacer />

                </ThemedCard>
            </ScrollView>
        </ThemedView>
    );
};

export default OccurrenceEvidences;

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
        width: '15%',
        alignSelf: "center",
    },
})