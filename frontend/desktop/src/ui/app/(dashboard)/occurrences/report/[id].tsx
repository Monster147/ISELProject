import Spacer from "@commons/components/Spacer";
import ThemedText from "@commons/components/ThemedText";
import ThemedView from "@components/ThemedView";
import ThemedButton from "@commons/components/ThemedButton";
import { StyleSheet, Text, useColorScheme } from "react-native";
import { Colors } from "@commons/constants/Colors";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import ThemedLoader from "@components/ThemedLoader";
import { useEffect, useState } from "react";
import { useConfirmAction } from "@hooks/system/confirmAction";
import { useOccurrence } from "@hooks/data/useOccurrence";
import { useReport } from "@hooks/data/useReport";
import { useAuth } from "@hooks/data/useAuth";
import { Report } from "@commons/models/report/Report";
import ThemedCard from "@commons/components/ThemedCard";
import { ReportStatus } from "@commons/models/report/ReportStatus";
import ThemedTextInput from "@commons/components/ThemedTextInput";

/**
 * Ecrã de relatório de uma ocorrência (versão desktop/web).
 * Carrega o relatório associado à ocorrência (se existir) e permite criar, editar, submeter e
 * descarregar o relatório via `useReport`, pedindo confirmação nas ações relevantes.
 */
const OccurrenceReport = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const { t, i18n } = useTranslation();
  const { occurrenceId } = useParams();
  const navigate = useNavigate();
  const occurrenceIdNumber = Number(occurrenceId);
  const {
    createReport,
    findReportByOccurrenceId,
    submitReport,
    updateReport,
    downloadReport,
  } = useReport();
  const { occurrence } = useOccurrence();
  const { user } = useAuth();
  const confirmAction = useConfirmAction();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const actualOccurrence = occurrence.find((o) => o.id === occurrenceIdNumber);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        const foundReport = await findReportByOccurrenceId(occurrenceIdNumber);
        setCurrentReport(foundReport);
        setError(null);
      } catch (err: any) {
        setCurrentReport(null);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    if (occurrenceIdNumber && user) {
      loadReport();
    }
  }, [occurrenceIdNumber, user]);

  const handleCreateReport = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      await createReport(
        user.id,
        occurrenceIdNumber,
        title,
        description,
        {},
        i18n.language,
      );
      const foundReport = await findReportByOccurrenceId(occurrenceIdNumber);
      setCurrentReport(foundReport);
    } catch (err: any) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!currentReport) return;
    confirmAction(
      async () => {
        try {
          setLoading(true);
          setError(null);
          await submitReport(currentReport.id);
          const foundReport =
            await findReportByOccurrenceId(occurrenceIdNumber);
          setCurrentReport(foundReport);
        } catch (err: any) {
          if (err instanceof Error) setError(err.message);
          else setError(String(err));
        } finally {
          setLoading(false);
        }
      },
      {
        title: t("report.submit"),
        message: t("report.submitMessage"),
        cancelText: t("report.cancel"),
        confirmText: t("report.submitConfirm"),
      },
    );
  };

  const handleDownloadReport = async () => {
    if (!currentReport) return;

    confirmAction(
      async () => {
        try {
          setLoading(true);
          setError(null);
          await downloadReport(currentReport.id);
        } catch (err: any) {
          if (err instanceof Error) setError(err.message);
          else setError(String(err));
        } finally {
          setLoading(false);
        }
      },
      {
        title: t("report.download"),
        message: t("report.downloadMessage"),
        cancelText: t("report.cancel"),
        confirmText: t("report.downloadConfirm"),
      },
    );
  };

  const handleUpdateReport = async () => {
    if (!currentReport) return;
    confirmAction(
      async () => {
        try {
          setLoading(true);
          setError(null);
          await updateReport(currentReport.id);
          const foundReport =
            await findReportByOccurrenceId(occurrenceIdNumber);
          setCurrentReport(foundReport);
        } catch (err: any) {
          if (err instanceof Error) setError(err.message);
          else setError(String(err));
        } finally {
          setLoading(false);
        }
      },
      {
        title: t("report.update"),
        message: t("report.updateMessage"),
        cancelText: t("report.cancel"),
        confirmText: t("report.updateConfirm"),
      },
    );
  };

  if (loading) {
    return (
      <ThemedView safe={true} style={styles.container}>
        <ThemedLoader />
      </ThemedView>
    );
  }

  if (!actualOccurrence) {
    return (
      <ThemedView safe={true} style={styles.container}>
        <Spacer />
        <ThemedText style={styles.heading}>
          {t("report.occurrenceNotFound")}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView safe={true} style={styles.container}>
      <Spacer />

      <ThemedText title={true} style={styles.heading}>
        {t("report.report")}
      </ThemedText>

      <Spacer />

      {!currentReport ? (
        <ThemedView style={styles.container}>
          <ThemedCard style={styles.card}>
            <ThemedText title={true} style={styles.heading}>
              {t("report.createReport")}
            </ThemedText>

            <ThemedTextInput
              style={{
                width: "80%",
                margin: 20,
                backgroundColor: theme.uiBackground2,
                alignSelf: "center",
              }}
              placeholder={t("report.title")}
              value={title}
              onChangeText={setTitle}
            />

            <ThemedTextInput
              style={{
                width: "80%",
                margin: 20,
                backgroundColor: theme.uiBackground2,
                alignSelf: "center",
              }}
              placeholder={t("report.description")}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <ThemedButton
              onPress={handleCreateReport}
              style={styles.create}
              disabled={loading}
            >
              <ThemedText style={{ color: "#fff", textAlign: "center" }}>
                {t("report.create")}
              </ThemedText>
            </ThemedButton>
            <ThemedButton onPress={() => navigate(-1)} style={styles.cancel}>
              <ThemedText style={{ color: "#fff", textAlign: "center" }}>
                {t("evidences.goBack")}
              </ThemedText>
            </ThemedButton>
          </ThemedCard>
        </ThemedView>
      ) : (
        <ThemedCard style={styles.card}>
          <ThemedText>
            {t("report.title")}: {currentReport.title}
          </ThemedText>

          <ThemedText>
            {t("report.description")}: {currentReport.description}
          </ThemedText>

          <ThemedText>
            {t("report.status")}: {t(`reportStatus.${currentReport.status}`)}
          </ThemedText>

          <Spacer />
          {(currentReport.status == ReportStatus.REJECTED ||
            currentReport.status == ReportStatus.EDITING) && (
            <ThemedButton
              onPress={handleUpdateReport}
              style={styles.update}
              disabled={loading}
            >
              <ThemedText style={{ color: "#fff", textAlign: "center" }}>
                {t("report.update")}
              </ThemedText>
            </ThemedButton>
          )}

          <ThemedButton onPress={handleDownloadReport} style={styles.download}>
            <ThemedText style={{ color: "#fff", textAlign: "center" }}>
              {t("report.download")}
            </ThemedText>
          </ThemedButton>

          {(currentReport.status == ReportStatus.REJECTED ||
            currentReport.status == ReportStatus.EDITING) && (
            <ThemedButton
              onPress={handleSubmitReport}
              style={styles.submit}
              disabled={loading}
            >
              <ThemedText style={{ color: "#fff", textAlign: "center" }}>
                {t("report.submit")}
              </ThemedText>
            </ThemedButton>
          )}
          <ThemedButton onPress={() => navigate(-1)} style={styles.cancel}>
            <ThemedText style={{ color: "#fff", textAlign: "center" }}>
              {t("evidences.goBack")}
            </ThemedText>
          </ThemedButton>
          {error && <Text style={styles.error}>{error}</Text>}
        </ThemedCard>
      )}
    </ThemedView>
  );
};

export default OccurrenceReport;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
  },
  card: {
    margin: 20,
  },
  create: {
    marginTop: 40,
    backgroundColor: Colors.success,
    width: "15%",
    alignSelf: "center",
  },
  remove: {
    marginTop: 40,
    backgroundColor: Colors.warning,
    width: "15%",
    alignSelf: "center",
  },
  heading: {
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
  error: {
    color: Colors.warning,
    padding: 10,
    backgroundColor: "#f5c1c8",
    borderColor: Colors.warning,
    borderWidth: 1,
    borderRadius: 6,
    marginHorizontal: 10,
  },
  input: {
    width: "80%",
    margin: 20,
    alignSelf: "center",
  },
  submit: {
    marginTop: 20,
    backgroundColor: Colors.success,
    width: "15%",
    alignSelf: "center",
  },
  update: {
    marginTop: 20,
    backgroundColor: Colors.update,
    width: "15%",
    alignSelf: "center",
  },
  download: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    width: "15%",
    alignSelf: "center",
  },
  cancel: {
    marginTop: 20,
    backgroundColor: Colors.warning,
    width: "15%",
    alignSelf: "center",
  },
});
