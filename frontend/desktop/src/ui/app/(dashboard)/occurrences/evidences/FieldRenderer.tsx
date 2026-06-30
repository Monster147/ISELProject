import { useTranslation } from "react-i18next";
import ThemedView from "@components/ThemedView";
import ThemedText from "@commons/components/ThemedText";
import Select from "react-select";
import { TouchableOpacity, StyleSheet, Image } from "react-native";
import { ACCEPTED_FILE_TYPES } from "@commons/models/utils/AcceptedFileTypes";
import ThemedButton from "@commons/components/ThemedButton";
import ThemedFileInput from "@components/ThemedFileInput";
import ThemedDateInput from "@components/ThemedDateInput";
import ThemedTextInput from "@commons/components/ThemedTextInput";
import { Colors } from "@commons/constants/Colors";
import { getLabelByLanguage } from "@commons/utils/getLabelByLanguage";

/**
 * Rótulo de um campo do formulário, com indicação de obrigatoriedade.
 *
 * @param label Texto do rótulo.
 * @param required Se true, acrescenta um asterisco a marcar o campo como obrigatório.
 */
const FieldLabel = ({ label, required }) => (
  <ThemedText style={styles.label} label={true}>
    {label}
    {required && <ThemedText style={styles.required}> *</ThemedText>}
  </ThemedText>
);

/**
 * Contentor visual de um campo do formulário, com cor de fundo e estilos configuráveis.
 *
 * @param background Cor de fundo do contentor.
 * @param style Estilos adicionais a aplicar.
 * @param children Conteúdo do campo a renderizar.
 */
const FieldContainer = ({ background, style, children }) => (
  <ThemedView
    style={[styles.fieldContainer, style, { backgroundColor: background }]}
  >
    {children}
  </ThemedView>
);

/**
 * Renderiza dinamicamente um campo do formulário consoante o seu tipo (texto, data, ficheiro,
 * seleção de intervenientes, etc.), tratando alterações de valor e de ficheiro.
 *
 * @param field Definição do campo a renderizar (tipo, nome, rótulo, obrigatoriedade...).
 * @param value Valor atual do campo.
 * @param onChange Callback invocado quando o valor do campo muda.
 * @param onFileChange Callback invocado quando o ficheiro associado ao campo muda.
 * @param intervenients Lista de intervenientes disponível para campos de seleção.
 * @param colorScheme Esquema de cores ativo (claro/escuro) para temar o campo.
 * @param fileValues Mapa dos ficheiros atualmente selecionados, por nome de campo.
 */
export const FieldRenderer = ({
  field,
  value,
  onChange,
  onFileChange,
  intervenients,
  colorScheme,
  fileValues,
}) => {
  const theme = Colors[colorScheme] ?? Colors.light;
  const { t, i18n } = useTranslation();

  const displayLabel = getLabelByLanguage(field.label, i18n.language);

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
    const old = fileValues[name];
    if (old?.previewUrl) {
      URL.revokeObjectURL(old.previewUrl);
    }

    onFileChange(name, null);
  };

  if (field.dynamicOptions) {
    const options = intervenients.map((opt) => ({
      value: opt[field.dynamicOptions.valueField],
      label: opt[field.dynamicOptions.labelField],
    }));
    return (
      <FieldContainer background={theme.uiBackground}>
        <FieldLabel label={displayLabel} required={field.required} />

        <Select
          options={options}
          placeholder={t("form.selectOption", {
            defaultValue: t("evidences.select"),
          })}
          value={options.find((o) => String(o.value) === String(value)) ?? null}
          onChange={(selected) => onChange(field.name, selected?.value)}
          menuPortalTarget={document.body}
          menuPosition="fixed"
        />
      </FieldContainer>
    );
  }

  switch (field.type) {
    case "select": {
      if (!field.options) break;
      const translatedOptions = field.options.map((opt) => ({
        ...opt,
        label: getLabelByLanguage(opt.label, i18n.language),
      }));
      const selectedOption =
        translatedOptions.find((opt) => opt.value === value) ?? null;
      return (
        <FieldContainer background={theme.uiBackground}>
          <FieldLabel label={displayLabel} required={field.required} />

          <Select
            options={translatedOptions}
            value={selectedOption}
            isDisabled={field.readOnly}
            onChange={(selected) => onChange(field.name, selected?.value ?? "")}
            placeholder={t("form.selectOption", {
              defaultValue: t("evidences.select"),
            })}
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </FieldContainer>
      );
    }

    case "boolean":
      return (
        <FieldContainer background={theme.uiBackground}>
          <ThemedView
            style={[styles.boolRow, { backgroundColor: theme.uiBackground }]}
          >
            <FieldLabel label={displayLabel} required={field.required} />

            <TouchableOpacity
              style={[styles.toggle, value && styles.toggleActive]}
              onPress={() => !field.readOnly && onChange(field.name, !value)}
              activeOpacity={0.8}
            >
              <ThemedView
                style={[styles.toggleThumb, value && styles.toggleThumbActive]}
              />
            </TouchableOpacity>
          </ThemedView>
        </FieldContainer>
      );

    case "image":
    case "file": {
      const accept = field.type === "image" ? "image/*" : ACCEPTED_FILE_TYPES;
      const isImage = value?.type?.startsWith("image/");
      const isFile = value?.type?.startsWith("application/");
      const fileNameWithoutExtension = value?.name?.replace(/\.[^/.]+$/, "");
      if (isImage) {
        return (
          <FieldContainer
            background={theme.uiBackground}
            style={styles.imagePreviewContainer}
          >
            <FieldLabel label={displayLabel} required={field.required} />

            <a
              href={value.previewUrl}
              download={value.name}
              style={styles.downloadImageLink}
            >
              <Image
                source={value.previewUrl}
                style={styles.imagePreview}
                resizeMode="cover"
              />
            </a>

            <ThemedView
              style={[
                styles.imageInfoContainer,
                { backgroundColor: theme.uiBackground },
              ]}
            >
              <ThemedText style={styles.imageName}>
                {fileNameWithoutExtension}
              </ThemedText>

              <ThemedText style={styles.downloadHint}>
                {t("evidences.clickToDownload")}
              </ThemedText>

              <ThemedButton
                style={styles.removeFileButton}
                onPress={() => handleRemoveFile(field.name)}
              >
                <ThemedText style={styles.removeFileButtonText}>
                  {" "}
                  {t("evidences.remove")}{" "}
                </ThemedText>
              </ThemedButton>
            </ThemedView>
          </FieldContainer>
        );
      }

      if (isFile) {
        const fileNameWithoutExtension = value.name?.replace(/\.[^/.]+$/, "");
        return (
          <FieldContainer
            background={theme.uiBackground}
            style={styles.imagePreviewContainer}
          >
            <FieldLabel label={displayLabel} required={field.required} />
            <ThemedView
              style={[
                styles.imageInfoContainer,
                { backgroundColor: theme.uiBackground },
              ]}
            >
              <ThemedText style={styles.imageName}>
                {" "}
                {fileNameWithoutExtension}{" "}
              </ThemedText>
              <a
                href={value.previewUrl}
                download={value.name}
                style={styles.downloadLink}
              >
                <ThemedButton style={styles.downloadButton}>
                  <ThemedText style={styles.downloadButtonText}>
                    {" "}
                    {t("evidences.download")}{" "}
                  </ThemedText>
                </ThemedButton>
              </a>

              <ThemedButton
                style={styles.removeFileButton}
                onPress={() => handleRemoveFile(field.name)}
              >
                <ThemedText style={styles.removeFileButtonText}>
                  {" "}
                  {t("evidences.remove")}{" "}
                </ThemedText>
              </ThemedButton>
            </ThemedView>
          </FieldContainer>
        );
      }

      return (
        <FieldContainer background={theme.uiBackground}>
          <FieldLabel label={displayLabel} required={field.required} />

          <ThemedFileInput accept={accept} onChange={handleFileInput} />
        </FieldContainer>
      );
    }

    case "datetime":
      return (
        <FieldContainer background={theme.uiBackground}>
          <FieldLabel label={displayLabel} required={field.required} />

          <ThemedDateInput
            value={value ?? ""}
            onChangeText={(val) => onChange(field.name, val)}
            style={styles.dateInput}
          />
        </FieldContainer>
      );

    case "number":
      return (
        <FieldContainer background={theme.uiBackground}>
          <FieldLabel label={displayLabel} required={field.required} />

          <ThemedTextInput
            placeholder={displayLabel}
            value={value !== undefined && value !== null ? String(value) : ""}
            onChangeText={(text) => {
              const num = Number(text);

              onChange(field.name, Number.isFinite(num) ? num : 0);
            }}
            keyboardType="numeric"
            editable={!field.readOnly}
            style={styles.input}
          />
        </FieldContainer>
      );
  }

  return (
    <FieldContainer background={theme.uiBackground}>
      <FieldLabel label={displayLabel} required={field.required} />

      <ThemedTextInput
        placeholder={displayLabel}
        value={value ?? ""}
        onChangeText={(text) => onChange(field.name, text)}
        multiline={field.type === "text"}
        numberOfLines={field.type === "text" ? 4 : 1}
        editable={!field.readOnly}
        style={[styles.input, field.type === "text" && styles.textarea]}
      />
    </FieldContainer>
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

  dateInput: { flex: 1, height: 40 },

  boolRow: { flexDirection: "row", justifyContent: "space-between" },
  toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: "#ccc" },
  toggleActive: { backgroundColor: Colors.success },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  toggleThumbActive: { alignSelf: "flex-end" },

  imagePreviewContainer: { alignItems: "center", gap: 12 },
  imagePreview: { width: 220, height: 220, borderRadius: 12 },
  imageInfoContainer: { alignItems: "center", gap: 8 },
  imageName: { fontSize: 15, fontWeight: "600" },

  downloadLink: { textDecoration: "none" },
  downloadButton: { minWidth: 120 },
  downloadButtonText: { color: "#fff", fontWeight: "600", textAlign: "center" },

  downloadImageLink: { textDecoration: "none" },
  downloadHint: { fontSize: 13, opacity: 0.7 },

  removeFileButton: { marginTop: 4, minWidth: 120 },
  removeFileButtonText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
});
