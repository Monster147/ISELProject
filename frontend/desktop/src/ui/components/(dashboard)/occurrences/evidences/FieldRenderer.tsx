import {useTranslation} from "react-i18next";
import ThemedView from "../../../../../../components/ThemedView";
import ThemedText from "../../../../../../components/ThemedText";
import Select from "react-select";
import {TouchableOpacity, StyleSheet} from "react-native";
import {ACCEPTED_FILE_TYPES} from "@commons/models/utils/AcceptedFileTypes";
import ThemedButton from "../../../../../../components/ThemedButton";
import ThemedFileInput from "../../../../../../components/ThemedFileInput";
import ThemedDateInput from "../../../../../../components/ThemedDateInput";
import ThemedTextInput from "../../../../../../components/ThemedTextInput";
import {Colors} from "@commons/constants/Colors";

export const FieldRenderer = ({field, value, onChange, onFileChange, intervenients, theme}) => {
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

    const handleRemoveFile = (name: string) => {
        onFileChange(name, null);
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

        const isImage =
            value?.type?.startsWith("image/");

        if(isImage) {
            const fileNameWithoutExtension =
                value.name?.replace(/\.[^/.]+$/, "");
            return (
                <ThemedView
                    style={[
                        styles.fieldContainer,
                        styles.imagePreviewContainer,
                        {backgroundColor: theme.uiBackground},
                    ]}
                >
                    <a
                        href={value.previewUrl}
                        download={value.name}
                        style={styles.downloadImageLink}
                    >
                        <img
                            src={value.previewUrl}
                            style={styles.imagePreview}
                        />
                    </a>

                    <ThemedView
                        style={[
                            styles.imageInfoContainer,
                            {backgroundColor: theme.uiBackground},
                        ]}
                    >
                        <ThemedText style={styles.imageName}>
                            {fileNameWithoutExtension}
                        </ThemedText>

                        <ThemedText style={styles.downloadHint}>
                            Carregar na imagem para descarregar
                        </ThemedText>

                        <ThemedButton
                            style={styles.removeFileButton}
                            onPress={() => handleRemoveFile(field.name)}
                        >
                            <ThemedText style={styles.removeFileButtonText}>
                                Remover
                            </ThemedText>
                        </ThemedButton>
                    </ThemedView>
                </ThemedView>
            );
        }

        const isFile =
            value?.type?.startsWith("application/");

        if(isFile) {
            const fileNameWithoutExtension =
                value.name?.replace(/\.[^/.]+$/, "");
            return (
                <ThemedView
                    style={[
                        styles.fieldContainer,
                        styles.imagePreviewContainer,
                        {backgroundColor: theme.uiBackground},
                    ]}
                >
                    <ThemedView style={[styles.imageInfoContainer, {backgroundColor: theme.uiBackground}]}>
                        <ThemedText style={styles.imageName}>
                            {fileNameWithoutExtension}
                        </ThemedText>
                        <a
                            href={value.previewUrl}
                            download={value.name}
                            style={styles.downloadLink}
                        >
                            <ThemedButton style={styles.downloadButton}>
                                <ThemedText style={styles.downloadButtonText}>
                                    Download
                                </ThemedText>
                            </ThemedButton>
                        </a>

                        <ThemedButton
                            style={styles.removeFileButton}
                            onPress={() => handleRemoveFile(field.name)}
                        >
                            <ThemedText style={styles.removeFileButtonText}>
                                Remover
                            </ThemedText>
                        </ThemedButton>
                    </ThemedView>
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

const styles = StyleSheet.create({
    fieldContainer: { marginBottom: 10 },
    label: { fontSize: 13, opacity: 0.65, marginBottom: 4 },
    required: { color: Colors.warning },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        marginTop: 2,
    },
    textarea: { minHeight: 90, textAlignVertical: "top" },

    boolRow: { flexDirection: "row", justifyContent: "space-between" },
    toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: "#ccc" },
    toggleActive: { backgroundColor: Colors.success },
    toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff" },
    toggleThumbActive: { alignSelf: "flex-end" },

    imagePreviewContainer: { alignItems: "center", gap: 12 },
    imagePreview: { width: 220, height: 220, borderRadius: 12 },
    imageInfoContainer: { alignItems: "center", gap: 8 },
    imageName: { fontSize: 15, fontWeight: "600" },

    downloadLink: { textDecoration: "none" },
    downloadButton: { minWidth: 120 },
    downloadButtonText: { fontWeight: "600" },

    downloadImageLink: { textDecoration: "none" },
    downloadHint: { fontSize: 13, opacity: 0.7 },

    removeFileButton: { marginTop: 4, minWidth: 120 },
    removeFileButtonText: { fontWeight: "600" },
});