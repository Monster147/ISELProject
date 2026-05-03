import { StyleSheet, ScrollView, Text } from "react-native";
import { useTranslation } from "react-i18next";
import {useLocalSearchParams, useRouter} from "expo-router";
import ThemedView from "../../../../components/ThemedView";
import ThemedText from "../../../../components/ThemedText";
import ThemedCard from "../../../../components/ThemedCard";
import ThemedLoader from "../../../../components/ThemedLoader";
import Spacer from "../../../../components/Spacer";
import ThemedTextInput from "../../../../components/ThemedTextInput";
import ThemedButton from "../../../../components/ThemedButton";
import ThemedFileInput from "../../../../components/ThemedFileInput";
import { Colors } from "@commons/constants/Colors";
import { useOccurrence } from "../../../../hooks/useOccurrence";
import { useType } from "../../../../hooks/useType";
import { useEvidence } from "../../../../hooks/useEvidence";
import { useAuth } from "../../../../hooks/useAuth";
import { useState } from "react";
import { pick } from '@react-native-documents/picker'
import type { UploadFile } from "@commons/models/utils/UploadFile"
import {useBackRedirect} from "../../../../hooks/useBackRedirect";

const OccurrenceEvidences = () => {
    const { t } = useTranslation();
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const occurrenceId = Number(id);
    const { occurrence } = useOccurrence();
    const { type } = useType();
    const { createEvidence } = useEvidence();
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    useBackRedirect(() => router.back())
    const [form, setForm] = useState({
        type: "",
        location: "",
        description: "",
    });

    const [file, setFile] = useState<UploadFile | null>(null);

    const actualOccurrence = occurrence.find(o => o.id === occurrenceId);

    if (!actualOccurrence || loading) {
        return (
            <ThemedView safe={true} style={styles.container}>
                <ThemedLoader />
            </ThemedView>
        );
    }

    const handlePickFile = async () => {
        try {
            const result = await pick({
                type: [
                    "image/jpg",
                    "image/*",
                    "application/pdf",
                    "video/mp4",
                    "image/heic",
                ],
                allowMultiSelection: false,
            });

            setLoading(true);

            if (!result || result.length === 0) return;

            const asset = result[0];

            setFile({
                platform: "mobile",
                uri: asset.uri,
                name: asset.name ?? "file",
                type: asset.type ?? "application/octet-stream",
            });

        } catch (err) {
            console.error("File pick error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!file || !user) return;
        try {
            setLoading(true);

            await createEvidence(
                file,
                form.type,
                form.location,
                form.description,
                user.id,
                occurrenceId
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
                    <ThemedText
                        title={true}
                        style={[styles.title, { alignSelf: "center" }]}
                    >
                        {t("occurrenceEvidences.occurrenceEvidences", {
                            defaultValue: "Evidências da Ocorrência",
                        })}
                    </ThemedText>

                    <Spacer />

                    <ThemedTextInput
                        placeholder={t("occurrenceEvidences.type")}
                        value={form.type}
                        onChangeText={(text) =>
                            setForm(prev => ({ ...prev, type: text }))
                        }
                        style={styles.input}
                    />

                    <ThemedTextInput
                        placeholder={t("occurrenceEvidences.location")}
                        value={form.location}
                        onChangeText={(text) =>
                            setForm(prev => ({ ...prev, location: text }))
                        }
                        style={styles.input}
                    />

                    <ThemedTextInput
                        placeholder={t("occurrenceEvidences.description")}
                        value={form.description}
                        onChangeText={(text) =>
                            setForm(prev => ({ ...prev, description: text }))
                        }
                        style={styles.input}
                    />

                    <ThemedFileInput
                        label={t("occurrenceEvidences.uploadEvidenceFile")}
                        onPress={handlePickFile}
                    />

                    <ThemedButton
                        onPress={handleSubmit}
                        style={styles.create}
                    >
                        <ThemedText style={{ color: "#fff", textAlign: "center" }}>
                            {t("occurrenceEvidences.uploadEvidence")}
                        </ThemedText>
                    </ThemedButton>

                    {error && (
                        <Text style={styles.error}>
                            {error}
                        </Text>
                    )}
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
        margin: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        marginVertical: 8,
        borderRadius: 6,
    },
    create: {
        marginTop: 20,
        backgroundColor: Colors.success,
        width: "60%",
        alignSelf: "center",
        padding: 10,
        borderRadius: 6,
    },
    error: {
        color: Colors.warning,
        marginTop: 10,
    },
});