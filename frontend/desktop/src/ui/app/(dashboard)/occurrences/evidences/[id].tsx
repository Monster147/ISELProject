import { StyleSheet, FlatList, useColorScheme } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { useCallback, useEffect, useState } from "react";
import ThemedView from "@components/ThemedView";
import ThemedText from "@commons/components/ThemedText";
import ThemedCard from "@commons/components/ThemedCard";
import ThemedLoader from "@components/ThemedLoader";
import ThemedButton from "@commons/components/ThemedButton";
import { Colors } from "@commons/constants/Colors";
import { useOccurrence } from "@hooks/data/useOccurrence";
import { useType } from "@hooks/data/useType";
import { useAuth } from "@hooks/data/useAuth";
import { useIntervenor } from "@hooks/data/useIntervenor";
import { UploadFile } from "@commons/models/utils/UploadFile";
import { OccurrenceTypeForm } from "@commons/models/type/OccorrenceTypeForm";
import { expandSections } from "@commons/models/type/Helpers";
import { FormField } from "@commons/models/type/FormField";
import { useEvidence } from "@hooks/data/useEvidence";
import { useNetworkStatus } from "@hooks/system/useNetworkStatus";
import { FieldRenderer } from "./FieldRenderer";
import {
  useOccurrenceListener,
  SSEMessage,
} from "../../../../../../hooks/listeners/useOccurrenceListener";
import { getLabelByLanguage } from "@commons/utils/getLabelByLanguage";

const DynamicOccurrenceForm = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { occurrenceId } = useParams();
  const id = Number(occurrenceId);

  const { occurrence } = useOccurrence();
  const { intervenor } = useIntervenor();
  const {
    createEvidence,
    findEvidenceByOccurrenceId,
    downloadEvidence,
    deleteEvidence,
    updateEvidence,
  } = useEvidence();
  const { type } = useType();
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();

  const [sectionEvidenceMap, setSectionEvidenceMap] = useState({});
  const [fileEvidenceMap, setFileEvidenceMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [fileValues, setFileValues] = useState({});
  const [error, setError] = useState<{
    section: string;
    message: string;
  } | null>(null);
  const [loadingFields, setLoadingFields] = useState<Record<string, boolean>>(
    {},
  );
  const [successMessage, setSuccessMessage] = useState<{
    section: string;
    message: string;
  } | null>(null);
  const [isUpdatingFromSSE, setIsUpdatingFromSSE] = useState(false);

  const actualOccurrence = occurrence.find((o) => o.id === id);

  const currentType = type.find(
    (tp) => tp.id === actualOccurrence?.occurrenceType,
  );

  const sanitizeFileName = (name: string): string => {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();
  };

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
  };

  const populateForm = async (sections, data) => {
    const formNext = {};
    const fileNext = {};
    const fileEvidenceNext = {};
    for (const section of sections) {
      if (section.data) {
        for (const [key, value] of Object.entries(section.data)) {
          formNext[key] = value;
        }
      }

      if (section.files) {
        for (const file of section.files) {
          const ev = data.find((e) => e.filePath === file.filePath);
          if (!ev) continue;
          const populated = await buildFileObject(ev);
          fileNext[file.field] = {
            ...populated,
            remote: true,
          };
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
        const data = await findEvidenceByOccurrenceId(id);
        const sectionJsons = data.filter(
          (ev) =>
            ev.filePath?.endsWith(".json") && ev.filePath?.includes("section-"),
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
          }),
        );
        await populateForm(parsedSections, data);
        const map = {};
        for (const sec of parsedSections) {
          const sanitizedKey = sanitizeFileName(sec.section);
          map[sanitizedKey] = sec.evidenceId;
        }
        setSectionEvidenceMap(map);
      } catch (err: any) {
      } finally {
        setLoading(false);
      }
    };
    if (isOnline) loadEvidences();
  }, [actualOccurrence?.id, isOnline]);

  let formDef: OccurrenceTypeForm | null = null;

  if (currentType?.form) {
    try {
      const raw =
        typeof currentType.form === "string"
          ? JSON.parse(currentType.form)
          : currentType.form;

      formDef = raw.sections ? raw : (raw.form ?? null);
    } catch {
      formDef = null;
    }
  }

  const intervenients = intervenor.filter((iv) =>
    actualOccurrence?.intervenors.some((id) => String(id) === String(iv.id)),
  );

  const expandedSections = formDef?.sections
    ? expandSections(formDef.sections, formValues, i18n.language)
    : [];

  const handleChange = (name: string, value: any, autofill?: any) => {
    setFormValues((prev) => {
      const next = { ...prev, [name]: value };

      if (autofill && value) {
        const selected = intervenients.find(
          (iv: any) => String(iv.id) === String(value),
        );

        if (selected) {
          for (const [target, source] of Object.entries(autofill)) {
            next[target] = (selected as any)[source] ?? "";
          }
        }
      }

      return next;
    });
  };

  const handleFieldChange = (field: FormField, value: any) => {
    handleChange(field.name, value, field.dynamicOptions?.autofill);
  };

  const handleFileChange = (name: string, file: UploadFile | null) => {
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

  const replaceEvidence = async (
    uploadFile,
    type,
    label,
    userId,
    sectionName?,
  ) => {
    let existingId;
    if (type === "json" && sectionName) {
      existingId = sectionEvidenceMap[sectionName];
    }

    if (type !== "json") {
      existingId = fileEvidenceMap[label];
    }

    if (existingId) {
      const stillExists = (await findEvidenceByOccurrenceId(id))?.some(
        (e) => e.id === existingId,
      );
      if (stillExists && type !== "json") {
        await deleteEvidence(existingId);
      }

      if (type === "json" && sectionName) {
        setSectionEvidenceMap((prev) => {
          const copy = { ...prev };
          delete copy[sectionName];
          return copy;
        });
      }

      if (type !== "json") {
        setFileEvidenceMap((prev) => {
          const copy = { ...prev };
          delete copy[label];
          return copy;
        });
      }
    }

    let evidence;

    if (type === "json" && sectionName) {
      let created;
      if (existingId) {
        created = await updateEvidence(uploadFile, existingId);
      } else {
        created = await createEvidence(
          uploadFile,
          "json",
          "NO LOCATION",
          label,
          userId,
          id,
        );
      }
      evidence = created;

      setSectionEvidenceMap((prev) => ({
        ...prev,
        [sectionName]: created.id,
      }));
    }

    if (type !== "json") {
      const created = await createEvidence(
        uploadFile,
        uploadFile.type.startsWith("image/") ? "IMAGE" : "FILE",
        "NO LOCATION",
        label,
        userId,
        id,
      );

      evidence = created;

      const blob = await downloadEvidence(created.id);
      const previewUrl = URL.createObjectURL(blob);

      setFileEvidenceMap((prev) => ({
        ...prev,
        [label]: created.id,
      }));

      setFileValues((prev) => ({
        ...prev,
        [label]: {
          platform: "web",
          file: uploadFile.file,
          name: uploadFile.name,
          type: uploadFile.type,
          previewUrl: previewUrl,
          evidenceId: created.id,
          filePath: created.filePath,
          remote: true,
        },
      }));
    }

    return evidence;
  };

  const saveSection = async (section: any) => {
    if (!user) return;

    const displayTitle = getLabelByLanguage(section.title, i18n.language);

    setLoadingFields((prev) => ({
      ...prev,
      [displayTitle]: true,
    }));
    setSuccessMessage(null);
    setError(null);

    try {
      const sectionData: Record<string, any> = {};
      const uploadedFilesMetadata: any[] = [];
      const sectionTitle = sanitizeFileName(displayTitle);
      for (const field of section.fields) {
        const value = formValues[field.name];
        const upload = fileValues[field.name];
        if (field.type === "file" || field.type === "image") {
          if (upload === null) {
            const existingId = fileEvidenceMap[field.name];

            if (existingId) {
              await deleteEvidence(existingId);

              setFileEvidenceMap((prev) => {
                const copy = { ...prev };
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
              user.id,
              sectionTitle,
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

      const fileName = `section-${sectionTitle}.json`;

      const blob = new Blob([JSON.stringify(json)], {
        type: "application/json",
      });
      const file = new File([blob], fileName, { type: "application/json" });

      const uploadFile: UploadFile = {
        platform: "web",
        file,
        name: file.name,
        type: file.type,
      };

      await replaceEvidence(
        uploadFile,
        "json",
        sectionTitle,
        user.id,
        sectionTitle,
      );
      setSuccessMessage({
        section: sectionTitle,
        message: t("evidences.savedSuccess"),
      });
    } catch (err: any) {
      setError({ section: displayTitle, message: t("evidences.savingError") });
    } finally {
      setLoadingFields((prev) => ({
        ...prev,
        [displayTitle]: false,
      }));
    }
  };

  const handleOccurrenceUpdate = useCallback(
    async (message: SSEMessage) => {
      if (message.action === "EvidenceChanged") {
        try {
          const data = await findEvidenceByOccurrenceId(id);
          const sectionJsons = data.filter(
            (ev) =>
              ev.filePath?.endsWith(".json") &&
              ev.filePath?.includes("section-"),
          );

          const parsedSections = await Promise.all(
            sectionJsons.map(async (ev) => {
              try {
                const blob = await downloadEvidence(ev.id);
                const text = await blob.text();
                const json = JSON.parse(text);
                return { ...json, evidenceId: ev.id };
              } catch (err: any) {
                return null;
              }
            }),
          ).then((results) => results.filter((res) => res !== null));

          await populateForm(parsedSections, data);
          const map = {};
          for (const sec of parsedSections) {
            const sanitizedKey = sanitizeFileName(sec.section);
            map[sanitizedKey] = sec.evidenceId;
          }
          setSectionEvidenceMap(map);
          const remoteFileIds = data.map((ev) => ev.id);
          setFileEvidenceMap((prev) => {
            const updated = { ...prev };
            for (const key in updated) {
              if (!remoteFileIds.includes(updated[key])) {
                delete updated[key];
              }
            }
            return updated;
          });
          setFileValues((prev) => {
            const updated = { ...prev };
            for (const key in updated) {
              const file = updated[key];
              if (
                file?.remote &&
                file?.evidenceId &&
                !remoteFileIds.includes(file.evidenceId)
              ) {
                if (file.previewUrl) {
                  URL.revokeObjectURL(file.previewUrl);
                }
                delete updated[key];
              }
            }
            return updated;
          });
        } catch (err) {
          console.error(err);
        }
      }
    },
    [id, findEvidenceByOccurrenceId, downloadEvidence, populateForm],
  );

  useOccurrenceListener(user?.id, String(id), handleOccurrenceUpdate, isOnline);

  if (!formDef || !actualOccurrence || !currentType || loading) {
    return (
      <ThemedView safe style={styles.container}>
        <ThemedLoader />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={expandedSections}
        keyExtractor={(item, index) => `${item.title}-${index}`}
        contentContainerStyle={styles.list}
        renderItem={({ item: section }) => {
          const displayTitle = getLabelByLanguage(section.title, i18n.language);

          return (
            <ThemedCard style={styles.card}>
              <ThemedView
                style={[
                  styles.sectionHeader,
                  { backgroundColor: theme.uiBackground },
                ]}
              >
                <ThemedText style={styles.sectionTitle} title={true}>
                  {displayTitle}
                </ThemedText>

                <ThemedButton
                  onPress={() => saveSection(section)}
                  style={styles.saveBtn}
                  disabled={loadingFields[displayTitle]}
                >
                  <ThemedText style={{ color: "#fff", textAlign: "center" }}>
                    {t("evidences.save")}
                  </ThemedText>
                </ThemedButton>
              </ThemedView>

              <ThemedView
                style={[
                  styles.fieldsContainer,
                  { backgroundColor: theme.uiBackground },
                ]}
              >
                {loadingFields[displayTitle] ? (
                  <ThemedView>
                    <ThemedLoader
                      style={[{ backgroundColor: theme.uiBackground }]}
                    />
                  </ThemedView>
                ) : (
                  section.fields.map((field: FormField) => (
                    <FieldRenderer
                      key={field.name}
                      field={field}
                      value={
                        field.type === "file" || field.type === "image"
                          ? fileValues[field.name]
                          : formValues[field.name]
                      }
                      intervenients={intervenients}
                      onChange={(name, value) =>
                        handleFieldChange(field, value)
                      }
                      onFileChange={handleFileChange}
                      colorScheme={colorScheme}
                      fileValues={fileValues}
                    />
                  ))
                )}
              </ThemedView>
              {successMessage && successMessage.section === displayTitle && (
                <ThemedText
                  style={{
                    ...styles.errorText,
                    color: Colors.success,
                    marginTop: 12,
                  }}
                >
                  {successMessage.message}
                </ThemedText>
              )}
              {error && error.section === displayTitle && (
                <ThemedText style={{ ...styles.errorText, marginTop: 12 }}>
                  {error.message}
                </ThemedText>
              )}
            </ThemedCard>
          );
        }}
      />
      <ThemedButton onPress={() => navigate(-1)} style={styles.cancel}>
        <ThemedText style={{ color: "#fff", textAlign: "center" }}>
          {t("evidences.goBack")}
        </ThemedText>
      </ThemedButton>
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
  cancel: {
    marginTop: 40,
    backgroundColor: Colors.warning,
    width: "15%",
    alignSelf: "center",
  },
});
