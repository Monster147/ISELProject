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
import {useEvidence} from "../../../../../hooks/useEvidence";
import {useState} from "react";
import {useAuth} from "../../../../../hooks/useAuth";
import ThemedTextInput from "../../../../../../components/ThemedTextInput";
import ThemedButton from "../../../../../../components/ThemedButton";
import ThemedFileInput from "../../../../../../components/ThemedFileInput";
import {UploadFile} from "@commons/models/utils/UploadFile";
import {ACCEPTED_FILE_TYPES} from "@commons/models/utils/AcceptedFileTypes";

const OccurrenceEvidences = () => {
    const {t} = useTranslation();
    const {occurrenceId} = useParams();
    const navigate = useNavigate();

    const id = Number(occurrenceId);

    const {occurrence} = useOccurrence();
    const {type} = useType();
    const {createEvidence} = useEvidence();
    const {user} = useAuth()

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        type: "",
        location: "",
        description: "",
    });
    const [file, setFile] = useState<UploadFile | null>(null);

    const actualOccurrence = occurrence.find(o => o.id === id);

    if (!actualOccurrence || loading) {
        return (
            <ThemedView safe={true} style={styles.container}>
                <ThemedLoader />
            </ThemedView>
        );
    }

    const currentType = type.find(tp => tp.id === actualOccurrence.occurrenceType);

    const existingEvidenceIds = actualOccurrence.evidence ?? [];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile({
                platform: "web",
                file: selected,
                name: selected.name,
                type: selected.type,
            });
        }
    };

    const handleSubmit = async () => {
        try {
            if (!file || !user) return;

            setLoading(true);

            await createEvidence(file,
                form.type,
                form.location,
                form.description,
                user.id,
                id
            );

            setError(null);

        } catch (err: any) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView safe={true} style={styles.container}>
            <ScrollView>
                <ThemedCard style={styles.card}>
                    <ThemedText title={true} style={[styles.title, {alignSelf: "center"}]}>
                        {t("occurrenceEvidences.title", { defaultValue: "Evidências da Ocorrência" })}
                    </ThemedText>

                    <Spacer />

                    <ThemedTextInput
                        placeholder={t("occurrenceEvidences.type")}
                        value={form.type}
                        onChangeText={(text) =>
                            setForm(prev => ({...prev, type: text}))
                        }
                        style={styles.input}
                    />

                    <ThemedTextInput
                        placeholder={t("occurrenceEvidences.location")}
                        value={form.location}
                        onChangeText={(text) =>
                            setForm(prev => ({...prev, location: text}))
                        }
                        style={styles.input}
                    />

                    <ThemedTextInput
                        placeholder={t("occurrenceEvidences.description")}
                        value={form.description}
                        onChangeText={(text) =>
                            setForm(prev => ({...prev, description: text}))
                        }
                        style={styles.input}
                    />

                    <ThemedFileInput
                        accept={ACCEPTED_FILE_TYPES}
                        onChange={handleFileChange}
                    />

                    <ThemedButton
                        onPress={handleSubmit}
                        style={styles.create}
                    >
                        <ThemedText style={{color: "#fff", textAlign: "center"}}>
                            {t("occurrenceEvidences.uploadEvidence")}
                        </ThemedText>
                    </ThemedButton>

                    {error && (
                        <Text style={styles.error}>
                            {error}
                        </Text>
                    )}

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
        alignSelf: "center",
    },
    card: {
        margin: 20
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        marginVertical: 8,
        borderRadius: 6
    },

    create: {
        marginTop: 20,
        backgroundColor: Colors.success,
        width: '60%',
        alignSelf: "center",
        padding: 10,
        borderRadius: 6
    },

    error: {
        color: Colors.warning,
        marginTop: 10
    }
})