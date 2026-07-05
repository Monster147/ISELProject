import { StyleSheet, ScrollView } from "react-native";
import ThemedView from "@components/ThemedView";
import { Colors } from "@commons/constants/Colors";
import ThemedText from "@commons/components/ThemedText";
import { useParams, useNavigate } from "react-router";
import { useOccurrence } from "@hooks/data/useOccurrence";
import ThemedCard from "@commons/components/ThemedCard";
import ThemedLoader from "@components/ThemedLoader";
import ThemedButton from "@commons/components/ThemedButton";
import { useTranslation } from "react-i18next";
import Spacer from "@commons/components/Spacer";
import { useType } from "@hooks/data/useType";
import dateFormater from "@commons/utils/dateFormater";
import { getLabelByLanguage } from "@commons/utils/getLabelByLanguage";

/**
 * Ecrã de detalhe de uma ocorrência (versão desktop/web).
 * Obtém a ocorrência pelo `id` da rota e mostra as suas datas, importância e tipo, com botões
 * para navegar para as evidências, os intervenientes e o relatório associados.
 */
const OccurrenceDetails = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const occurrenceId = Number(id);
  const { occurrence } = useOccurrence();
  const actualOccurrence = occurrence.find((o) => o.id === occurrenceId);
  const { type } = useType();

  const currentJsonType = type.find(
    (t) => t.id === actualOccurrence?.occurrenceType,
  );

  if (!actualOccurrence) {
    return (
      <ThemedView safe={true} style={styles.container}>
        <ThemedLoader />
      </ThemedView>
    );
  }

  const handleEvidences = async () => {
    navigate(`/occurrence/evidences/${occurrenceId}`);
  };

  const handleIntervenors = async () => {
    navigate(`/occurrence/intervenors/${occurrenceId}`);
  };

  const handleReport = async () => {
    navigate(`/occurrence/report/${occurrenceId}`);
  };

  const renderOccurInfo = (data) => {
    return getLabelByLanguage(
      {
        pt: data?.messagePT,
        en: data?.messageEN,
        es: data?.messageES,
      },
      i18n.language,
    );
  };

  return (
    <ThemedView safe={true} style={styles.container}>
      <ScrollView>
        <ThemedCard style={styles.card}>
          <ThemedText
            title={true}
            style={[styles.title, { alignSelf: "center" }]}
          >
            {t("occurrenceDetails.occurrenceDetails")}
          </ThemedText>

          <Spacer />

          <ThemedText>
            {t("occurrenceDetails.initDate")}:{" "}
            {dateFormater(actualOccurrence.initDate)}
          </ThemedText>

          <ThemedText>
            {t("occurrenceDetails.endDate")}:{" "}
            {dateFormater(actualOccurrence.endDate)}
          </ThemedText>

          <ThemedText>
            {t("occurrenceDetails.importance")}:{" "}
            {t(`importance.${actualOccurrence.importance}`)}
          </ThemedText>

          <ThemedText>
            {t("occurrenceDetails.occurrenceType")}: {currentJsonType?.name}
          </ThemedText>

          <ThemedText>
            {t("occurrenceDetails.occurrenceInfo")}:{" "}
            {renderOccurInfo(actualOccurrence.occurrenceInfo)}
          </ThemedText>
          <ThemedButton onPress={handleEvidences} style={styles.create}>
            <ThemedText style={{ color: "#fff", textAlign: "center" }}>
              {t("occurrenceDetails.goEvidences")}
            </ThemedText>
          </ThemedButton>
          <ThemedButton onPress={handleIntervenors} style={styles.create}>
            <ThemedText style={{ color: "#fff", textAlign: "center" }}>
              {t("occurrenceDetails.seeIntervenors")}
            </ThemedText>
          </ThemedButton>

          <ThemedButton onPress={handleReport} style={styles.create}>
            <ThemedText style={{ color: "#fff", textAlign: "center" }}>
              {t("occurrenceDetails.seeReport")}
            </ThemedText>
          </ThemedButton>

          <ThemedButton
            onPress={() => navigate(`/occurrence`)}
            style={styles.cancel}
          >
            <ThemedText style={{ color: "#fff", textAlign: "center" }}>
              {t("evidences.goBack")}
            </ThemedText>
          </ThemedButton>
        </ThemedCard>
      </ScrollView>
    </ThemedView>
  );
};

export default OccurrenceDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
  },
  title: {
    fontSize: 22,
    marginVertical: 10,
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
  cancel: {
    marginTop: 40,
    backgroundColor: Colors.warning,
    width: "15%",
    alignSelf: "center",
  },
});
