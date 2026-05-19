import {StyleSheet, ScrollView, Text, useColorScheme, FlatList} from "react-native";
import { useTranslation } from "react-i18next";
import {useLocalSearchParams, useRouter} from "expo-router";
import {useEffect, useState} from "react";
import * as FileSystem from "expo-file-system";

import ThemedView from "../../../../components/ThemedView";
import ThemedText from "../../../../components/ThemedText";
import ThemedCard from "../../../../components/ThemedCard";
import ThemedLoader from "../../../../components/ThemedLoader";
import ThemedButton from "../../../../components/ThemedButton";
import OfflineBanner from "../../../../components/ThemedOfflineBanner";

import { useOccurrence } from "../../../../hooks/useOccurrence";
import { useType } from "../../../../hooks/useType";
import { useEvidence } from "../../../../hooks/useEvidence";
import { useAuth } from "../../../../hooks/useAuth";
import {useNetworkStatus} from "../../../../hooks/useNetworkStatus";
import {useIntervenor} from "../../../../hooks/useIntervenor";
import {useBackRedirect} from "../../../../hooks/useBackRedirect";

import { Colors } from "@commons/constants/Colors";
import type { UploadFile } from "@commons/models/utils/UploadFile"
import {OccurrenceTypeForm} from "@commons/models/type/OccorrenceTypeForm";
import {FormField} from "@commons/models/type/FormField";
import {expandSections} from "@commons/models/type/Helpers";
import FieldRenderer from "./FieldRenderer";
import {PaperProvider} from "react-native-paper";
import {Paths, File} from "expo-file-system";

const LOG_PREFIX = "[EVIDENCES]";

export const log = (...args: any[]) =>
    console.log(LOG_PREFIX, ...args);

const logError = (...args: any[]) =>
    console.error(LOG_PREFIX, ...args);

const DynamicOccurrenceForm  = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const { t } = useTranslation();
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const occurrenceId = Number(id);

    const { occurrence } = useOccurrence();
    const { intervenor } = useIntervenor();
    const { type } = useType();
    const {createEvidence, findEvidenceByOccurrenceId, downloadEvidence, deleteEvidence} = useEvidence();
    const { user } = useAuth();
    const { isOnline } = useNetworkStatus();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sectionEvidenceMap, setSectionEvidenceMap] = useState({});
    const [fileEvidenceMap, setFileEvidenceMap] = useState({});
    const [formValues, setFormValues] = useState({});
    const [fileValues, setFileValues] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useBackRedirect(() => router.back())

    const actualOccurrence = occurrence.find(o => o.id === occurrenceId);
    const currentType = type.find(
        (tp) => tp.id === actualOccurrence?.occurrenceType
    );

    const buildFileObject = async (ev: any) => {
        const res = await downloadEvidence(ev.id, false);
        const fileName = ev.filePath.split("/").pop();
        const cachedPath = res.path();

        const fileObject = {
            platform: "mobile",
            uri: `file://${cachedPath}`,
            name: fileName,
            type: res.respInfo?.headers?.["content-type"] || "application/octet-stream",
            evidenceId: ev.id,
            filePath: ev.filePath,
            remote: true,
        };
        return fileObject
    };

    const populateForm = async (sections, data) => {
        const formNext = {};
        const fileNext = {};
        const fileEvidenceNext = {};

        for (const section of sections) {
            for (const [key, value] of Object.entries(section.data)) {
                formNext[key] = value;
            }

            if (section.files) {
                for (const file of section.files) {
                    const ev = data.find((e) => e.filePath === file.filePath);

                    if (!ev) continue;

                    const populated =
                        await buildFileObject(ev);

                    fileNext[file.field] = populated;

                    fileEvidenceNext[file.field] = ev.id;
                }
            }
        }

        setFormValues((prev) => ({
            ...prev,
            ...formNext,
        }));
        setFileValues((prev) => ({
            ...prev,
            ...fileNext,
        }));
        setFileEvidenceMap((prev) => ({
            ...prev,
            ...fileEvidenceNext,
        }));
    };

    useEffect(() => {
        const loadEvidences = async () => {
            setLoading(true);
            try {
                const data = await findEvidenceByOccurrenceId(occurrenceId);
                const sectionJsons = data.filter((ev) =>
                        ev.filePath?.endsWith(".json") &&
                        ev.filePath?.includes("section-")
                );

                const parsedSections = await Promise.all(
                    sectionJsons.map(async (ev) => {
                        const res = await downloadEvidence(ev.id, false);
                        const text = await res.text();
                        await res.flush();
                        const json = JSON.parse(text);
                        return {
                            ...json,
                            evidenceId: ev.id,
                        };
                    })
                );

                await populateForm(parsedSections, data);
                const map = {};
                for (const sec of parsedSections) {
                    const sanitizedKey = sanitizeFileName(sec.section);
                    map[sanitizedKey] = sec.evidenceId;
                }
                setSectionEvidenceMap(map);
            } catch (err: any) {
                console.error(err);
                setError(
                    "Erro ao carregar evidências."
                );
            } finally {
                setLoading(false);
            }
        };

        if (isOnline) {
            loadEvidences();
        }
    }, [actualOccurrence?.id, isOnline]);

    let formDef: OccurrenceTypeForm | null = null;

    if (currentType?.form) {
        try {
            const raw =
                typeof currentType.form === "string"
                    ? JSON.parse(currentType.form)
                    : currentType.form;

            formDef = raw.sections
                ? raw
                : raw.form ?? null;
        } catch {
            formDef = null;
        }
    }

    const intervenients = intervenor.filter((iv) =>
        actualOccurrence?.intervenors.some(
            (id) => String(id) === String(iv.id)
        )
    );

    const expandedSections = formDef?.sections
        ? expandSections(formDef.sections, formValues)
        : [];

    const handleChange = (
        name: string,
        value: any,
        autofill?: any
    ) => {
        setFormValues((prev) => {
            const next = {...prev, [name]: value};

            if (autofill && value) {
                const selected = intervenients.find(
                    (iv: any) =>
                        String(iv.id) === String(value)
                );

                if (selected) {
                    for (const [target, source] of Object.entries(
                        autofill
                    )) {
                        next[target] =
                            (selected as any)[source] ?? "";
                    }
                }
            }

            return next;
        });
    };

    const handleFieldChange = (
        field: FormField,
        value: any
    ) => {
        handleChange(
            field.name,
            value,
            field.dynamicOptions?.autofill
        );
    };

    const handleFileChange = (
        name: string,
        file: UploadFile | null
    ) => {
        setFileValues((prev) => {
            const next = { ...prev };

            if (file === null) {
                next[name] = null;
                return next;
            }

            next[name] = file;
            return next;
        });
    };

    const replaceEvidence = async(uploadFile, type, label, sectionName?, userId) => {
        let existingId;
        if(type === "json" && sectionName) {
            existingId = sectionEvidenceMap[sectionName];
        }

        if(type !== "json") {
            existingId = fileEvidenceMap[label];
        }

        if(existingId) {
            await deleteEvidence(existingId);

            if (type === "json" && sectionName) {
                setSectionEvidenceMap(prev => {
                    const copy = { ...prev };
                    delete copy[sectionName];
                    return copy;
                });
            }

            if (type !== "json") {
                setFileEvidenceMap(prev => {
                    const copy = { ...prev };
                    delete copy[label];
                    return copy;
                });
            }
        }

        const created = await createEvidence(
            uploadFile,
            type === "json"
                ? "json"
                : uploadFile.type.startsWith("image/")
                    ? "IMAGE"
                    : "FILE",
            "NO LOCATION",
            label,
            userId,
            occurrenceId
        );

        if (type === "json" && sectionName) {
            setSectionEvidenceMap(prev => ({...prev, [sectionName]: created.id}));
        }

        if (type !== "json") {
            setFileEvidenceMap(prev => ({...prev, [label]: created.id}));
        }

        return created;
    }

    const sanitizeFileName = (name: string): string => {
        return name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9]/g, "-")
            .replace(/-+/g, "-")
            .toLowerCase();
    };

    const saveSection = async (section: any) => {
        try {
            if (!user) return;
            const sectionData: Record<string, any> = {};
            const uploadedFilesMetadata: any[] = [];
            const sectionTitle = sanitizeFileName(section.title);

            for (const field of section.fields) {
                try {
                    const value = formValues[field.name];
                    const upload = fileValues[field.name];


                    if (field.type === "file" || field.type === "image") {
                        if (upload === null) {
                            const existingId = fileEvidenceMap[field.name];

                            if (existingId) {
                                await deleteEvidence(existingId);

                                setFileEvidenceMap(prev => {
                                    const copy = {...prev};
                                    delete copy[field.name];
                                    return copy;
                                });
                            }

                            continue;
                        }

                        if (upload?.remote) {
                            uploadedFilesMetadata.push({
                                field: field.name,
                                label: field.label,
                                fileName: upload.name,
                                mimeType: upload.type,
                                filePath: upload.filePath,
                            });

                            continue;
                        }

                        if (upload) {
                            const created = await replaceEvidence(
                                upload,
                                field.type === "image" ? "IMAGE" : "FILE",
                                field.name,
                                sectionTitle,
                                user.id
                            );

                            uploadedFilesMetadata.push({
                                field: field.name,
                                label: field.label,
                                fileName: upload.name,
                                mimeType: upload.type,
                                filePath: created.filePath,
                            });
                        }

                        continue;
                    }
                    sectionData[field.name] = value ?? null;
                } catch (fieldErr: any) {
                    logError(`Erro ao processar campo ${field.name}:`, fieldErr);
                    setError(`Erro ao processar campo ${field.name}: ${fieldErr.message}`);
                }
            }

            const json =
                uploadedFilesMetadata.length > 0
                    ? {
                        section: sectionTitle,
                        occurrenceId: id,
                        data: sectionData,
                        files: uploadedFilesMetadata,
                    }
                    : {
                        section: sectionTitle,
                        occurrenceId: id,
                        data: sectionData,
                    };

            if (!json.section || !json.data) {
                logError("JSON incompleto: secção ou dados faltam")
                throw new Error("JSON incompleto: secção ou dados faltam");
            }

            const fileName = `section-${sectionTitle}.json`;
            try {
                const file = new File(Paths.cache, fileName);

                file.create({ overwrite: true });
                file.write(JSON.stringify(json));

                log("Verificação:", file.textSync());

                const uploadFile: UploadFile = {
                    platform: "mobile",
                    uri: file.uri,
                    name: fileName,
                    type: "application/json",
                };

                await replaceEvidence(uploadFile, "json", sectionTitle, sectionTitle, user.id);
            } catch (err: any) {
                logError("Falha ao escrever ficheiro:", err.message);
                throw err;
            }
        } catch (err: any) {
            console.error("Erro em saveSection:", err);
            console.error("Stack:", err.stack);
            setError(`Erro ao guardar secção: ${err.message}`);
        }
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            console.log({
                occurrenceId: id,
                userId: user?.id,
                fields: formValues,
                files: fileValues,
            });
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            setError(
                "Erro ao submeter formulário."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (!formDef || !actualOccurrence || !currentType || loading) {
        return (
            <ThemedView safe={true} style={styles.container}>
                <ThemedLoader />
            </ThemedView>
        );
    }

    if (submitted) {
        return (
            <ThemedView safe style={styles.container}>
                <ThemedCard style={styles.card}>
                    <ThemedText
                        title
                        style={styles.successTitle}
                    >
                        Formulário submetido com sucesso
                    </ThemedText>
                </ThemedCard>
            </ThemedView>
        );
    }

    return (
        <PaperProvider>
            <ThemedView safe style={styles.container}>
                <FlatList
                    data={expandedSections}
                    keyExtractor={(item, index) =>
                        `${item.title}-${index}`}
                    contentContainerStyle={styles.list}
                    renderItem={({item: section}) => (
                        <ThemedCard style={styles.card}>
                            <ThemedView style={[styles.sectionHeader, {backgroundColor: theme.uiBackground,}]}>
                                <ThemedText style={styles.sectionTitle}>
                                    {section.title}
                                </ThemedText>

                                <ThemedButton
                                    onPress={() => saveSection(section)}
                                    style={styles.saveBtn}
                                >
                                    <ThemedText>
                                        Guardar
                                    </ThemedText>
                                </ThemedButton>
                            </ThemedView>

                            <ThemedView style={[styles.fieldsContainer, {backgroundColor: theme.uiBackground}]}>
                                {section.fields.map(
                                    (field: FormField) => (
                                        <FieldRenderer
                                            key={field.name}
                                            field={field}
                                            value={
                                                field.type === "file" ||
                                                field.type === "image"
                                                    ? fileValues[field.name]
                                                    : formValues[field.name]
                                            }
                                            intervenients={
                                                intervenients
                                            }
                                            onChange={(
                                                name,
                                                value
                                            ) =>
                                                handleFieldChange(
                                                    field,
                                                    value
                                                )
                                            }
                                            onFileChange={
                                                handleFileChange
                                            }
                                            theme={theme}
                                            downloadEvidence={downloadEvidence}
                                        />
                                    )
                                )}
                            </ThemedView>
                        </ThemedCard>
                    )}
                    ListFooterComponent={
                        <>
                            {error && (
                                <ThemedText
                                    style={styles.errorText}
                                >
                                    {error}
                                </ThemedText>
                            )}

                            <ThemedButton
                                onPress={handleSubmit}
                                disabled={submitting}
                                style={styles.submitBtn}
                            >
                                <ThemedText>
                                    {submitting
                                        ? "A submeter..."
                                        : "Submeter"}
                                </ThemedText>
                            </ThemedButton>
                        </>
                    }
                />
            </ThemedView>
        </PaperProvider>
    );
    return
};

export default DynamicOccurrenceForm;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    card: {
        marginHorizontal: 16,
        marginVertical: 10,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },

    successTitle: {
        textAlign: "center",
        fontSize: 20,
        paddingVertical: 20,
    },

    list: {
        paddingBottom: 40,
    },

    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        gap: 12,
    },

    sectionTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: "600",
    },

    saveBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },

    fieldsContainer: {
        gap: 12,
    },

    errorText: {
        color: Colors.warning,
        fontSize: 13,
        marginHorizontal: 20,
        marginTop: 8,
    },

    submitBtn: {
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 40,
    },
});