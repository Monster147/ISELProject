import {
  StyleSheet,
  FlatList,
  Text,
} from "react-native";
import ThemedView from "@components/ThemedView";
import { Colors } from "@commons/constants/Colors";
import ThemedText from "@commons/components/ThemedText";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useOccurrence } from "@hooks/data/useOccurrence";
import ThemedCard from "@commons/components/ThemedCard";
import ThemedLoader from "@components/ThemedLoader";
import ThemedButton from "@commons/components/ThemedButton";
import { useBackRedirect } from "@hooks/system/useBackRedirect";
import { useIntervenor } from "@hooks/data/useIntervenor";
import Spacer from "@commons/components/Spacer";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { confirmAction } from "@hooks/system/confirmAction";
import OfflineBanner from "@components/ThemedOfflineBanner";

const OccurrenceIntervenors = () => {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { intervenor } = useIntervenor();
  const occurrenceId = Number(id);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useBackRedirect(() => router.push(`/occurrences/${occurrenceId}`));

  const { occurrence, removeIntervenorFromOccurrence } = useOccurrence();
  const actualOccurrence = occurrence.find((o) => o.id === occurrenceId);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (actualOccurrence) {
      setRefreshing(true);
      const timer = setTimeout(() => setRefreshing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [actualOccurrence, intervenor]);

  if (!actualOccurrence || loading || refreshing) {
    return (
      <ThemedView safe={true} style={styles.container}>
        <ThemedLoader />
      </ThemedView>
    );
  }

  const handleIntervenors = async () => {
    router.replace(`/intervenor?selectMode=true&occurrenceId=${occurrenceId}`);
  };

  const occurrenceIntervenors = Array.isArray(intervenor)
    ? intervenor.filter((i) => actualOccurrence.intervenors.includes(i.id))
    : [];

  const handleRemove = (intervenorId: number) => {
    confirmAction(
      {
        title: t("removeIntervenor.title"),
        message: t("removeIntervenor.message"),
        cancelText: t("removeIntervenor.cancel"),
        confirmText: t("removeIntervenor.confirm"),
      },
      () => handleRemover(intervenorId),
    );
  };

  const handleRemover = async (intervenorId: number) => {
    try {
      setLoading(true);
      await removeIntervenorFromOccurrence(intervenorId, occurrenceId);
      setError(null);
    } catch (err: any) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const renderIntervenor = ({ item }) => (
    <ThemedCard style={styles.card}>
      <ThemedText style={{ alignSelf: "center" }}>
        {t("occurrenceIntervenors.intervenorId")}: {item.idNumber}
      </ThemedText>
      <ThemedText style={{ alignSelf: "center" }}>
        {t("occurrenceIntervenors.intervenorIdType")}: {item.idType}
      </ThemedText>
      <ThemedText style={{ alignSelf: "center" }}>
        {t("occurrenceIntervenors.intervenorName")}: {item.name}
      </ThemedText>
      <ThemedText style={{ alignSelf: "center" }}>
        {t("occurrenceIntervenors.intervenorPhoneNumber")}: {item.contactInfo}
      </ThemedText>
      <ThemedText style={{ alignSelf: "center" }}>
        {t("occurrenceIntervenors.intervenorAddress")}: {item.address}
      </ThemedText>

      <ThemedButton onPress={() => handleRemove(item.id)} style={styles.remove}>
        <ThemedText style={{ color: "#fff", textAlign: "center" }}>
          {t("occurrenceIntervenors.remove")}
        </ThemedText>
      </ThemedButton>
    </ThemedCard>
  );

  const isEmpty = occurrenceIntervenors.length === 0;

  return (
    <ThemedView safe={true} style={styles.container}>
      <Spacer />
      <ThemedText title={true} style={styles.heading}>
        {t("occurrenceIntervenors.occurrenceIntervenors")}
      </ThemedText>

      <Spacer />
      <OfflineBanner />
      {isEmpty ? (
        <ThemedView style={styles.emptyContainer}>
          <ThemedButton onPress={handleIntervenors} style={styles.create}>
            <ThemedText style={{ color: "#fff", textAlign: "center" }}>
              {t("occurrenceIntervenors.addIntervenors")}
            </ThemedText>
          </ThemedButton>
        </ThemedView>
      ) : (
        <FlatList
          data={occurrenceIntervenors}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderIntervenor}
          ListFooterComponent={
            <ThemedView style={styles.container}>
              {error && <Text style={styles.error}>{error}</Text>}
              <ThemedButton onPress={handleIntervenors} style={styles.create}>
                <ThemedText style={{ color: "#fff", textAlign: "center" }}>
                  {t("occurrenceIntervenors.addIntervenors")}
                </ThemedText>
              </ThemedButton>
            </ThemedView>
          }
        />
      )}
    </ThemedView>
  );
};

export default OccurrenceIntervenors;

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
    width: "75%",
    alignSelf: "center",
  },
  remove: {
    marginTop: 40,
    backgroundColor: Colors.warning,
    width: "75%",
    alignSelf: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
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
});
