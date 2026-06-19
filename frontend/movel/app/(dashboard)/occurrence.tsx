import { FlatList, Pressable, StyleSheet, useColorScheme } from "react-native";
import ThemedText from "../../../commons/components/ThemedText";
import ThemedView from "../../components/ThemedView";
import Spacer from "../../../commons/components/Spacer";
import { useOccurrence } from "../../hooks/useOccurrence";
import { useAuth } from "../../hooks/useAuth";
import React, { useEffect, useState } from "react";
import { Colors } from "@commons/constants/Colors";
import ThemedCard from "../../../commons/components/ThemedCard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAlertExitApp } from "../../hooks/useAlertExitApp";
import { useTranslation } from "react-i18next";
import ThemedLoader from "../../components/ThemedLoader";
import dateFormater from "@commons/utils/dateFormater";
import { Occurrence } from "@commons/models/occurrence/Occurrence";
import { OccurrenceType } from "@commons/models/occurrence/OccurrenceType";
import ThemedFilterButton from "../../components/ThemedFilterButton";
import ThemedTextInput from "../../../commons/components/ThemedTextInput";
import ThemedDateInput from "../../components/ThemedDateInput";
import OfflineBanner from "../../components/ThemedOfflineBanner";

const OccurrenceScreen = () => {
  const { t } = useTranslation();
  const { occurrence, loading } = useOccurrence();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<OccurrenceFilters>({});

  useAlertExitApp();

  if (loading) {
    return <ThemedLoader />;
  }

  const realOccurrenceList = filterOccurrence(filters, occurrence);

  const importanceOptions = Object.values(OccurrenceType) as OccurrenceType[];

  const toggleImportance = (value: OccurrenceType) => {
    setFilters((prev) => {
      let current = prev.importance ?? [];

      if (current.includes(value)) {
        current = current.filter((x) => x !== value);
      } else {
        current = [...current, value];
      }
      return {
        ...prev,
        importance: current.length ? current : undefined,
      };
    });
  };

  const handleMinDateChange = (date: string) => {
    setFilters((prev) => ({
      ...prev,
      minDate: date,
    }));
  };

  const handleMaxDateChange = (date: string) => {
    setFilters((prev) => ({
      ...prev,
      maxDate: date,
    }));
  };

  const clearFilters = () => {
    setFilters({
      importance: undefined,
      minDate: undefined,
      maxDate: undefined,
    });
  };

  return (
    <ThemedView style={styles.container} safe={true}>
      <Spacer />
      <ThemedText title={true} style={styles.heading}>
        {t("occurrence.occurrenceList")}
      </ThemedText>

      <OfflineBanner />

      <ThemedView style={styles.toolbar}>
        <ThemedFilterButton
          active={isFilterOpen}
          onPress={() => setIsFilterOpen((prev) => !prev)}
        />
      </ThemedView>

      {isFilterOpen && (
        <ThemedView
          style={[styles.filterPanel, { backgroundColor: theme.uiBackground }]}
        >
          <ThemedText title={true} style={styles.filterTitle}>
            {t("filter.filter")}
          </ThemedText>

          <ThemedText style={styles.subTitle}>
            {t("filter.importance")}:
          </ThemedText>
          <Spacer height={6} />
          <ThemedView
            style={[styles.row, { backgroundColor: theme.uiBackground }]}
          >
            {importanceOptions.map((imp) => (
              <Pressable key={imp} onPress={() => toggleImportance(imp)}>
                <ThemedText
                  style={[
                    styles.chip,
                    (filters.importance ?? []).includes(imp) &&
                      styles.chipActive,
                  ]}
                >
                  {t(`importance.${imp}`)}
                </ThemedText>
              </Pressable>
            ))}
          </ThemedView>

          <ThemedText style={styles.subTitle}>
            {t("filter.dateRange")}:
          </ThemedText>
          <ThemedView
            style={[styles.dateRow, { backgroundColor: theme.uiBackground }]}
          >
            <ThemedDateInput
              value={filters.minDate}
              onChangeText={handleMinDateChange}
              placeholder={t("filter.startDate")}
            />
            <ThemedDateInput
              value={filters.maxDate}
              onChangeText={handleMaxDateChange}
              placeholder={t("filter.endDate")}
            />
          </ThemedView>

          <ThemedView
            style={[styles.row, { backgroundColor: theme.uiBackground }]}
          >
            <Pressable onPress={clearFilters}>
              <ThemedText style={[styles.chipClear]}>
                {t("filter.clear")}
              </ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      )}

      <FlatList
        data={realOccurrenceList}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/occurrences/${item.id}`)}>
            <ThemedCard style={styles.card}>
              <ThemedText style={styles.title}>
                {t("occurrence.initDate")}: {dateFormater(item.initDate)}
              </ThemedText>
              <ThemedText style={styles.title}>
                {t("occurrence.endDate")}: {dateFormater(item.endDate)}
              </ThemedText>
              <ThemedText style={styles.title}>
                {t("occurrence.importance")}:
                <ThemedText
                  style={{
                    color: importanceColors[item.importance] || "black",
                  }}
                >
                  {t(`importance.${item.importance}`)}
                </ThemedText>
              </ThemedText>
            </ThemedCard>
          </Pressable>
        )}
      />
    </ThemedView>
  );
};

export default OccurrenceScreen;

export type OccurrenceFilters = {
  importance?: OccurrenceType[];
  maxDate?: string;
  minDate?: string;
};

const filterOccurrence = (
  options?: OccurrenceFilters,
  occurrences?: Occurrence[],
) => {
  if (!occurrences) return [];
  if (!options) return occurrences;
  let result = occurrences;
  if (options.importance) {
    result = result.filter((o) => options.importance?.includes(o.importance));
  }

  const maxDate = options?.maxDate?.trim();
  if (maxDate) {
    result = result.filter((o) => o.endDate <= maxDate);
  }

  const minDate = options?.minDate?.trim();
  if (minDate) {
    result = result.filter((o) => o.initDate >= minDate);
  }

  return result;
};

const importanceColors: Record<string, string> = {
  NORMAL: "lime",
  URGENT: "yellow",
  CRITICAL: "red",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
  },
  heading: {
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
  list: {
    marginTop: 40,
    paddingBottom: 20,
  },
  card: {
    width: "90%",
    marginHorizontal: "5%",
    marginVertical: 10,
    padding: 10,
    paddingLeft: 14,
    borderLeftColor: Colors.primary,
    borderLeftWidth: 4,
    alignSelf: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  toolbar: {
    width: "90%",
    marginHorizontal: "5%",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  filterPanel: {
    width: "90%",
    marginHorizontal: "5%",
    marginTop: 10,
    padding: 0,
    borderRadius: 5,
    borderLeftColor: Colors.primary,
    borderLeftWidth: 4,
    borderWidth: 0,
    overflow: "hidden",
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    padding: 16,
    paddingBottom: 12,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: "500",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  dateRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 8,
  },
  dateInput: {
    flex: 1,
    height: 40,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.update,
  },
  chipClear: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: Colors.warning,
  },
});
