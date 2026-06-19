import { useTranslation } from "react-i18next";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Dropdown } from "react-native-paper-dropdown";
import * as ImagePicker from "expo-image-picker";
import { pick } from "@react-native-documents/picker";
import * as Sharing from "expo-sharing";

import ThemedView from "../../../../components/ThemedView";
import ThemedText from "../../../../../commons/components/ThemedText";
import ThemedButton from "../../../../../commons/components/ThemedButton";
import ThemedDateInput from "../../../../components/ThemedDateInput";
import ThemedTextInput from "../../../../../commons/components/ThemedTextInput";

import { Colors } from "@commons/constants/Colors";
import ThemedFileInput from "../../../../components/ThemedFileInput";
import { useState } from "react";
import { confirmAction } from "../../../../utils/confirmAction";
import { getLabelByLanguage } from "@commons/utils/getLabelByLanguage";
import { useNetworkStatus } from "../../../../hooks/useNetworkStatus";

const FieldRenderer = ({
  field,
  value,
  onChange,
  onFileChange,
  intervenients,
  colorScheme,
  downloadEvidence,
}) => {
  const { t, i18n } = useTranslation();
  const { isOnline } = useNetworkStatus();
  const displayLabel = getLabelByLanguage(field.label, i18n.language);
  const theme = Colors[colorScheme] ?? Colors.light;
  const handleRemoveFile = (name: string) => {
    onFileChange(name, null);
  };

  const handleMediaPick = async (source: "gallery" | "camera") => {
    try {
      const permission =
        source === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        confirmAction({
          title: t("evidences.permissionNeeded"),
          message:
            source === "camera"
              ? t("evidences.cameraPermission")
              : t("evidences.galleryPermission"),
          cancelText: t("evidences.cancel"),
        });
        return;
      }

      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ["images", "videos"],
              quality: 0.8,
              allowsEditing: false,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images", "videos"],
              quality: 0.8,
              allowsEditing: false,
            });

      if (result.canceled) return;

      const asset = result.assets[0];

      onFileChange(field.name, {
        platform: "mobile",
        uri: asset.uri,
        name:
          asset.fileName ??
          `media-${Date.now()}.${asset.type === "video" ? "mp4" : "jpg"}`,
        type:
          asset.mimeType ??
          (asset.type === "video" ? "video/mp4" : "image/jpeg"),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileInput = async () => {
    try {
      const result = await pick({
        type: ["application/pdf"],
        allowMultiSelection: false,
      });

      if (!result || result.length === 0) return;

      const asset = result[0];

      onFileChange(field.name, {
        platform: "mobile",
        uri: asset.uri,
        name: asset.name ?? "file",
        type: asset.type ?? "application/octet-stream",
      });
    } catch (err) {
      console.error("File pick error:", err);
    }
  };

  const handleDownloadFile = async (file: any) => {
    try {
      if (!value?.evidenceId) {
        confirmAction({
          title: t("evidences.error"),
          message: t("evidences.noEvidenceId"),
          cancelText: t("evidences.cancel"),
        });
        return;
      }

      if (isOnline) {
        confirmAction(
          {
            title: t("evidences.confirmDownload"),
            message: t("evidences.downloadMessage"),
            confirmText: t("evidences.downloadConfirm"),
            cancelText: t("evidences.downloadCancel"),
          },
          async () => await downloadEvidence(value.evidenceId, true),
        );
      } else {
        confirmAction({
          title: t("warning.noConnection"),
          message: t("warning.noDownload"),
          cancelText: t("evidences.cancel"),
        });
      }
    } catch (err) {
      confirmAction({
        title: t("evidences.error"),
        message: t("evidences.failedDownload"),
        cancelText: t("evidences.cancel"),
      });
    }
  };

  if (field.dynamicOptions) {
    const options = intervenients.map((opt) => ({
      value: opt[field.dynamicOptions.valueField],
      label: opt[field.dynamicOptions.labelField],
    }));

    return (
      <ThemedView
        style={[styles.fieldContainer, { backgroundColor: theme.uiBackground }]}
      >
        <ThemedText style={styles.label} label={true}>
          {displayLabel}
          {field.required && (
            <ThemedText style={styles.required}> *</ThemedText>
          )}
        </ThemedText>

        <Dropdown
          options={options}
          placeholder={t("form.selectOption", {
            defaultValue: t("evidences.select"),
          })}
          value={value}
          onSelect={(selected) => {
            onChange(field.name, selected);
          }}
        />
      </ThemedView>
    );
  }

  if (field.type === "select" && field.options) {
    const translatedOptions = field.options.map((opt) => ({
      ...opt,
      label: getLabelByLanguage(opt.label, i18n.language),
    }));
    const selectedOption =
      translatedOptions.find((opt) => opt.value === value) ?? null;
    return (
      <ThemedView
        style={[styles.fieldContainer, { backgroundColor: theme.uiBackground }]}
      >
        <ThemedText style={styles.label} label={true}>
          {displayLabel}
          {field.required && (
            <ThemedText style={styles.required}> *</ThemedText>
          )}
        </ThemedText>

        <Dropdown
          options={translatedOptions}
          value={selectedOption}
          disabled={field.readOnly}
          onSelect={(selected) => onChange(field.name, selected ?? "")}
          placeholder={t("form.selectOption", {
            defaultValue: t("evidences.select"),
          })}
        />
      </ThemedView>
    );
  }

  if (field.type === "boolean") {
    return (
      <ThemedView
        style={[styles.fieldContainer, { backgroundColor: theme.uiBackground }]}
      >
        <ThemedView
          style={[styles.boolRow, { backgroundColor: theme.uiBackground }]}
        >
          <ThemedText style={styles.label} label={true}>
            {displayLabel}
          </ThemedText>

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
      </ThemedView>
    );
  }

  if (field.type === "image" || field.type === "file") {
    const isImage = value?.type?.startsWith("image/");

    if (isImage) {
      const fileNameWithoutExtension = value.name?.replace(/\.[^/.]+$/, "");

      return (
        <ThemedView
          style={[
            styles.fieldContainer,
            styles.imagePreviewContainer,
            { backgroundColor: theme.uiBackground },
          ]}
        >
          <ThemedText style={styles.label} label={true}>
            {displayLabel}
            {field.required && (
              <ThemedText style={styles.required}> *</ThemedText>
            )}
          </ThemedText>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleDownloadFile(value)}
          >
            <Image
              source={{ uri: value.uri }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
          </TouchableOpacity>

          <ThemedText style={styles.downloadHint}>
            {t("evidences.clickToDownload")}
          </ThemedText>

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
        </ThemedView>
      );
    }

    const isFile = value?.type?.startsWith("application/");

    if (isFile) {
      const fileNameWithoutExtension = value.name?.replace(/\.[^/.]+$/, "");

      return (
        <ThemedView
          style={[
            styles.fieldContainer,
            styles.imagePreviewContainer,
            { backgroundColor: theme.uiBackground },
          ]}
        >
          <ThemedText style={styles.label} label={true}>
            {displayLabel}
            {field.required && (
              <ThemedText style={styles.required}> *</ThemedText>
            )}
          </ThemedText>
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

            <ThemedButton
              style={styles.downloadButton}
              onPress={() => handleDownloadFile(value)}
            >
              <ThemedText style={styles.downloadButtonText}>
                {t("evidences.download")}
              </ThemedText>
            </ThemedButton>

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
        </ThemedView>
      );
    }

    return (
      <ThemedView
        style={[styles.fieldContainer, { backgroundColor: theme.uiBackground }]}
      >
        <ThemedText style={styles.label} label={true}>
          {displayLabel}
          {field.required && (
            <ThemedText style={styles.required}> *</ThemedText>
          )}
        </ThemedText>

        {field.type === "image" ? (
          <ThemedView
            style={[
              styles.imageButtonsContainer,
              { backgroundColor: theme.uiBackground },
            ]}
          >
            <ThemedButton
              style={styles.imageActionButton}
              onPress={() => handleMediaPick("gallery")}
            >
              <ThemedText style={styles.downloadButtonText}>
                {" "}
                {t("evidences.gallery")}{" "}
              </ThemedText>
            </ThemedButton>

            <ThemedButton
              onPress={() => handleMediaPick("camera")}
              style={styles.imageActionButton}
            >
              <ThemedText style={styles.downloadButtonText}>
                {" "}
                {t("evidences.camera")}{" "}
              </ThemedText>
            </ThemedButton>
          </ThemedView>
        ) : (
          <ThemedFileInput
            label={t("occurrenceEvidences.uploadEvidenceFile")}
            onPress={handleFileInput}
          />
        )}
      </ThemedView>
    );
  }

  if (field.type === "datetime") {
    return (
      <ThemedView
        style={[styles.fieldContainer, { backgroundColor: theme.uiBackground }]}
      >
        <ThemedText style={styles.label} label={true}>
          {displayLabel}
          {field.required && (
            <ThemedText style={styles.required}> *</ThemedText>
          )}
        </ThemedText>

        <ThemedDateInput
          placeholder={t("form.selectDateTime", {
            defaultValue: "Selecione data e hora...",
          })}
          value={value}
          onChangeText={(val) => {
            onChange(field.name, val);
          }}
          style={styles.dateInput}
        />
      </ThemedView>
    );
  }

  if (field.type === "number") {
    return (
      <ThemedView
        style={[styles.fieldContainer, { backgroundColor: theme.uiBackground }]}
      >
        <ThemedText style={styles.label} label={true}>
          {displayLabel}
          {field.required && (
            <ThemedText style={styles.required}> *</ThemedText>
          )}
        </ThemedText>

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
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={[styles.fieldContainer, { backgroundColor: theme.uiBackground }]}
    >
      <ThemedText style={styles.label} label={true}>
        {displayLabel}
        {field.required && <ThemedText style={styles.required}> *</ThemedText>}
      </ThemedText>

      <ThemedTextInput
        placeholder={displayLabel}
        value={value ?? ""}
        onChangeText={(text) => onChange(field.name, text)}
        multiline={field.type === "text"}
        numberOfLines={field.type === "text" ? 4 : 1}
        editable={!field.readOnly}
        style={[styles.input, field.type === "text" && styles.textarea]}
      />
    </ThemedView>
  );
};

export default FieldRenderer;

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

  boolRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ccc",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleActive: { backgroundColor: Colors.success },

  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  toggleThumbActive: { alignSelf: "flex-end" },

  dropdown: { borderRadius: 6, borderColor: "#ccc", minHeight: 48 },
  dropdownContainer: { borderRadius: 8 },

  imagePreviewContainer: { alignItems: "center", gap: 12 },
  imagePreview: { width: 220, height: 220, borderRadius: 12 },
  imageInfoContainer: { alignItems: "center", gap: 8 },
  imageButtonsContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  imageActionButton: {
    minWidth: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  imageName: { fontSize: 15, fontWeight: "600" },

  downloadButton: { minWidth: 140 },
  downloadButtonText: { color: "#fff", fontWeight: "600", textAlign: "center" },
  downloadHint: { fontSize: 13, opacity: 0.7 },

  removeFileButton: { marginTop: 4, minWidth: 120 },
  removeFileButtonText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
});
