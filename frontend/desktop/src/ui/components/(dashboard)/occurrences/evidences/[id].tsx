import {StyleSheet, FlatList, TouchableOpacity, useColorScheme,} from "react-native";
import {useTranslation} from "react-i18next";
import {useParams} from "react-router";
import {useState} from "react";
import Select from "react-select";

import ThemedView from "../../../../../../components/ThemedView";
import ThemedText from "../../../../../../components/ThemedText";
import ThemedCard from "../../../../../../components/ThemedCard";
import ThemedLoader from "../../../../../../components/ThemedLoader";
import ThemedTextInput from "../../../../../../components/ThemedTextInput";
import ThemedButton from "../../../../../../components/ThemedButton";
import ThemedFileInput from "../../../../../../components/ThemedFileInput";

import {Colors} from "@commons/constants/Colors";

import {useOccurrence} from "../../../../../hooks/useOccurrence";
import {useType} from "../../../../../hooks/useType";
import {useAuth} from "../../../../../hooks/useAuth";
import {useIntervenor} from "../../../../../hooks/useIntervenor";

import {UploadFile} from "@commons/models/utils/UploadFile";
import {ACCEPTED_FILE_TYPES} from "@commons/models/utils/AcceptedFileTypes";
import {OccurrenceTypeForm} from "@commons/models/type/OccorrenceTypeForm";
import {expandSections} from "@commons/models/type/Helpers";
import {FormField} from "@commons/models/type/FormField";
import ThemedDateInput from "../../../../../../components/ThemedDateInput";

const FieldRenderer = ({field, value, onChange, onFileChange, intervenients, theme}) => {
    const {t} = useTranslation();

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];

        if (!selected) return;

        onFileChange(field.name, {
            platform: "web",
            file: selected,
            name: selected.name,
            type: selected.type,
        });
    };

    if (field.dynamicOptions) {
        const options = intervenients.map((opt) => ({
            value: opt[field.dynamicOptions.valueField],
            label: opt[field.dynamicOptions.labelField],
        }));

        return (
            <ThemedView style={[styles.fieldContainer, {backgroundColor: theme.uiBackground}]}>
                <ThemedText style={styles.label}>
                    {field.label}
                    {field.required && (
                        <ThemedText style={styles.required}> *</ThemedText>
                    )}
                </ThemedText>

                <Select
                    options={options}
                    placeholder={t("form.selectOption", {
                        defaultValue: "Selecione...",
                    })}
                    value={
                        options.find(
                            (o) => String(o.value) === String(value)
                        ) ?? null
                    }
                    onChange={(selected) =>
                        onChange(field.name, selected?.value)
                    }
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                />
            </ThemedView>
        );
    }

    if (field.type === "select" && field.options) {
        const selectedOption =
            field.options.find(opt => opt.value === value) ?? null;
        return (
            <ThemedView style={[styles.fieldContainer, {backgroundColor: theme.uiBackground}]}>
                <ThemedText style={styles.label}>
                    {field.label}
                    {field.required && (
                        <ThemedText style={styles.required}> *</ThemedText>
                    )}
                </ThemedText>

                <Select
                    options={field.options}
                    value={selectedOption}
                    isDisabled={field.readOnly}
                    onChange={(selected) =>
                        onChange(field.name, selected?.value ?? "")
                    }
                    placeholder={t("form.selectOption", {
                        defaultValue: "Selecione...",
                    })}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                />
            </ThemedView>
        );
    }

    if (field.type === "boolean") {
        return (
            <ThemedView style={[styles.fieldContainer, {backgroundColor: theme.uiBackground}]}>
                <ThemedView style={[styles.boolRow, {backgroundColor: theme.uiBackground}]}>
                    <ThemedText style={styles.label}>
                        {field.label}
                    </ThemedText>

                    <TouchableOpacity
                        style={[
                            styles.toggle,
                            value && styles.toggleActive,
                        ]}
                        onPress={() =>
                            !field.readOnly &&
                            onChange(field.name, !value)
                        }
                        activeOpacity={0.8}
                    >
                        <ThemedView
                            style={[
                                styles.toggleThumb,
                                value && styles.toggleThumbActive,
                            ]}
                        />
                    </TouchableOpacity>
                </ThemedView>
            </ThemedView>
        );
    }

    if (field.type === "image" || field.type === "file") {
        const accept =
            field.type === "image"
                ? "image/*"
                : ACCEPTED_FILE_TYPES;

        return (
            <ThemedView style={[styles.fieldContainer, {backgroundColor: theme.uiBackground}]}>
                <ThemedText style={styles.label}>
                    {field.label}
                    {field.required && (
                        <ThemedText style={styles.required}> *</ThemedText>
                    )}
                </ThemedText>

                <ThemedFileInput
                    accept={accept}
                    onChange={handleFileInput}
                />
            </ThemedView>
        );
    }

    if (field.type === "datetime") {
        return (
            <ThemedView style={[styles.fieldContainer, {backgroundColor: theme.uiBackground}]}>
                <ThemedText style={styles.label}>
                    {field.label}
                    {field.required && (
                        <ThemedText style={styles.required}> *</ThemedText>
                    )}
                </ThemedText>

                <ThemedDateInput
                    value={value ?? ""}
                    onChangeText={(val) =>
                        onChange(field.name, val)
                    }
                    style={styles.dateInput}
                />
            </ThemedView>
        );
    }

    if (field.type === "number") {
        return (
            <ThemedView style={[styles.fieldContainer, {backgroundColor: theme.uiBackground}]}>
                <ThemedText style={styles.label}>
                    {field.label}
                    {field.required && (
                        <ThemedText style={styles.required}> *</ThemedText>
                    )}
                </ThemedText>

                <ThemedTextInput
                    placeholder={field.label}
                    value={
                        value !== undefined && value !== null
                            ? String(value)
                            : ""
                    }
                    onChangeText={(text) => {
                        const num = Number(text);

                        onChange(
                            field.name,
                            Number.isFinite(num) ? num : 0
                        );
                    }}
                    keyboardType="numeric"
                    editable={!field.readOnly}
                    style={styles.input}
                />
            </ThemedView>
        );
    }

    return (
        <ThemedView style={[styles.fieldContainer, {backgroundColor: theme.uiBackground}]}>
            <ThemedText style={styles.label}>
                {field.label}
                {field.required && (
                    <ThemedText style={styles.required}> *</ThemedText>
                )}
            </ThemedText>

            <ThemedTextInput
                placeholder={field.label}
                value={value ?? ""}
                onChangeText={(text) =>
                    onChange(field.name, text)
                }
                multiline={field.type === "text"}
                numberOfLines={field.type === "text" ? 4 : 1}
                editable={!field.readOnly}
                style={[
                    styles.input,
                    field.type === "text" && styles.textarea,
                ]}
            />
        </ThemedView>
    );
};

const DynamicOccurrenceForm = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const {occurrenceId} = useParams();
    const id = Number(occurrenceId);

    const {occurrence} = useOccurrence();
    const {intervenor} = useIntervenor();
    const {type} = useType();
    const {user} = useAuth();

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
        file: UploadFile
    ) => {
        setFileValues((prev) => ({
            ...prev,
            [name]: file,
        }));
    };

    const saveSection = async (section: any) => {
        console.log(section);
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

    if (!formDef || !actualOccurrence || !currentType) {
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
                                            field.type ===
                                            "file" ||
                                            field.type ===
                                            "image"
                                                ? fileValues[
                                                field.name
                                                ] ?? null
                                                : formValues[
                                                    field.name
                                                    ]
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

const webStyles = {
    select: {
        borderWidth: 1,
        borderColor: "#000",
        borderRadius: 6,
        padding: "10px 12px",
        fontSize: 14,
        width: "100%",
        marginTop: 4,
        background: "transparent",
    },
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    list: {
        paddingBottom: 40,
    },

    card: {
        marginHorizontal: 20,
        marginVertical: 10,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
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

    fieldsContainer: {
        gap: 12,
    },

    fieldContainer: {
        marginBottom: 10,
    },

    label: {
        fontSize: 13,
        opacity: 0.65,
        marginBottom: 4,
    },

    required: {
        color: Colors.warning,
    },

    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        marginTop: 2,
    },

    textarea: {
        minHeight: 90,
        textAlignVertical: "top",
    },

    boolRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    toggle: {
        width: 44,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#ccc",
        justifyContent: "center",
        padding: 2,
    },

    toggleActive: {
        backgroundColor: Colors.success,
    },

    toggleThumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#fff",
    },

    toggleThumbActive: {
        alignSelf: "flex-end",
    },

    filePreview: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 8,
    },

    fileName: {
        flex: 1,
        fontSize: 13,
    },

    fileRemove: {
        color: Colors.warning,
        fontSize: 16,
        paddingHorizontal: 4,
    },

    saveBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },

    submitBtn: {
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 40,
    },

    errorText: {
        color: Colors.warning,
        fontSize: 13,
        marginHorizontal: 20,
        marginTop: 8,
    },

    successTitle: {
        textAlign: "center",
        fontSize: 20,
        paddingVertical: 20,
    },

    dateInput: {
        flex: 1,
        height: 40,
    },
});