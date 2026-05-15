import {StyleSheet, FlatList, useColorScheme,} from "react-native";
import {useTranslation} from "react-i18next";
import {useParams} from "react-router";
import {useEffect, useState} from "react";

import ThemedView from "../../../../../../components/ThemedView";
import ThemedText from "../../../../../../components/ThemedText";
import ThemedCard from "../../../../../../components/ThemedCard";
import ThemedLoader from "../../../../../../components/ThemedLoader";
import ThemedButton from "../../../../../../components/ThemedButton";

import {Colors} from "@commons/constants/Colors";

import {useOccurrence} from "../../../../../hooks/useOccurrence";
import {useType} from "../../../../../hooks/useType";
import {useAuth} from "../../../../../hooks/useAuth";
import {useIntervenor} from "../../../../../hooks/useIntervenor";

import {UploadFile} from "@commons/models/utils/UploadFile";
import {OccurrenceTypeForm} from "@commons/models/type/OccorrenceTypeForm";
import {expandSections} from "@commons/models/type/Helpers";
import {FormField} from "@commons/models/type/FormField";
import {useEvidence} from "../../../../../hooks/useEvidence";
import {useNetworkStatus} from "../../../../../hooks/useNetworkStatus";
import {FieldRenderer} from "./FieldRenderer";

const DynamicOccurrenceForm = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const {occurrenceId} = useParams();
    const id = Number(occurrenceId);

    const {occurrence} = useOccurrence();
    const {intervenor} = useIntervenor();
    const {createEvidence, findEvidenceByOccurrenceId, downloadEvidence, deleteEvidence} = useEvidence();
    const {type} = useType();
    const {user} = useAuth();
    const { isOnline } = useNetworkStatus();


    const [sectionEvidenceMap, setSectionEvidenceMap] = useState({});
    const [fileEvidenceMap, setFileEvidenceMap] = useState({});
    const [loading, setLoading] = useState(false);
    const [formValues, setFormValues] = useState({});
    const [fileValues, setFileValues] = useState({});
    const [error, setError] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const actualOccurrence = occurrence.find(
        (o) => o.id === id
    );

    const currentType = type.find(
        (tp) => tp.id === actualOccurrence?.occurrenceType
    );

    const buildFileObject = async (ev) => {
        const blob = await downloadEvidence(ev.id);
        const file = new File([blob], ev.filePath.split("/").pop(), {
            type: blob.type || "application/octet-stream",
        });

        const url = URL.createObjectURL(file);
        return {
            platform: "web",
            file,
            name: ev.filePath.split("/").pop(),
            type: blob.type,
            previewUrl: url,
            evidenceId: ev.id,
            filePath: ev.filePath,
        };
    }

    const populateForm = async (sections, data) => {
        const formNext = {};
        const fileNext = {};
        const fileEvidenceNext = {};
        for (const section of sections) {
            for (const [key, value] of Object.entries(section.data)) {
                formNext[key] = value;
            }

            if(section.files) {
                for (const file of section.files) {
                    const ev = data.find(e =>  e.filePath === file.filePath);
                    if(!ev) continue;
                    const populated = await buildFileObject(ev);
                    fileNext[file.field] ={
                        ...populated,
                        remote: true
                    }
                    fileEvidenceNext[file.field] = ev.id;
                }
            }
        }

        setFormValues(prev => ({
            ...prev,
            ...formNext
        }));
        setFileValues(prev => ({
            ...prev,
            ...fileNext
        }));


        setFileEvidenceMap(prev => ({
            ...prev,
            ...fileEvidenceNext
        }));
    }

    useEffect(() => {
        const loadEvidences = async () => {
            setLoading(true);
            try {
                const data = await findEvidenceByOccurrenceId(id);
                const sectionJsons = data.filter(ev =>
                    ev.filePath?.endsWith(".json") &&
                    ev.filePath?.includes("section-")
                );

                const parsedSections = await Promise.all(
                    sectionJsons.map(async (ev) => {
                        const blob = await downloadEvidence(ev.id);
                        const text = await blob.text();
                        const json = JSON.parse(text);
                        return {
                            ...json,
                            evidenceId: ev.id,
                        };
                    })
                )
                console.log(parsedSections);
                await populateForm(parsedSections, data);
                const map = {};
                for (const sec of parsedSections){
                    map[sec.section] = sec.evidenceId;
                }
                setSectionEvidenceMap(map);
                console.log("mapa", map);
            } catch (err: any) {
            } finally {
                setLoading(false);
            }
        }
        if(isOnline) loadEvidences();
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
            const next = {...prev};

            if (file === null) {
                next[name] = null;
                return next;
            }

            next[name] = file;
            return next;
        });
    };

    const replaceEvidence = async(uploadFile, type, label, sectionName?, userId) => {
        let existingId
        console.log("sectionEvidenceMap ANTES", sectionEvidenceMap)
        console.log("fileEvidenceMap ANTES", fileEvidenceMap)
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
            id
        );

        if (type === "json" && sectionName) {
            setSectionEvidenceMap(prev => ({
                ...prev,
                [sectionName]: created.id,
            }));
        }

        if (type !== "json") {
            setFileEvidenceMap(prev => ({
                ...prev,
                [label]: created.id,
            }));
        }

        console.log("sectionEvidenceMap DEPOIS", sectionEvidenceMap)
        console.log("fileEvidenceMap DEPOIS", fileEvidenceMap)

        return created;
    }

    const saveSection = async (section: any) => {
        if (!user) return;
        const sectionData: Record<string, any> = {};
        const uploadedFilesMetadata: any[] = [];
        for (const field of section.fields) {
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
                        section.title,
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
        }

        console.log(sectionData);
        console.log(section);
        let json;
        if(uploadedFilesMetadata.length > 0) {
            json = {
                section: section.title,
                occurrenceId: id,
                data: sectionData,
                files: uploadedFilesMetadata,
            }
        } else {
            json = {
                section: section.title,
                occurrenceId: id,
                data: sectionData,
            }
        }

        const blob = new Blob([JSON.stringify(json)], { type: "application/json" });
        const file = new File([blob], `section-${section.title}.json`, { type: "application/json" });

        const uploadFile: UploadFile = {
            platform: "web",
            file,
            name:file.name,
            type: file.type,
        }

        await replaceEvidence(uploadFile, "json", section.title, section.title, user.id);
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
        } finally {
            setSubmitting(false);
        }
    };

    if (!formDef || !actualOccurrence || !currentType || loading) {
        return (
            <ThemedView safe style={styles.container}>
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
        <ThemedView style={styles.container}>
            <FlatList
                data={expandedSections}
                keyExtractor={(item, index) =>
                    `${item.title}-${index}`
                }
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
                                        fileValues={fileValues}
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
    );
};

export default DynamicOccurrenceForm;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    card: {
        marginHorizontal: 20,
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
    },

    sectionTitle: {
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