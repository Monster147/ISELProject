import {useContext, useEffect, useMemo, useState} from "react";
import {ScrollView, StyleSheet, View} from "react-native";
import {useColorScheme} from "react-native";
import {useTranslation} from "react-i18next";
import ThemedView from "../../components/ThemedView";
import ThemedText from "../../components/ThemedText";
import ThemedCard from "../../components/ThemedCard";
import Spacer from "../../components/Spacer";
import ThemedLoader from "../../components/ThemedLoader";
import {Colors} from "@commons/constants/Colors";
import {StatsContext} from "../../contexts/StatsContext";
import {OverviewStats} from "@commons/models/stats/OverviewStats";
import {StatsReportType} from "@commons/models/stats/StatsReportType";
import {StatsReportStatus} from "@commons/models/stats/StatsReportStatus";
import {StatsOccurrenceImportance} from "@commons/models/stats/StatsOccurrenceImportance";
import {api} from "@commons/api/api";
import {Type} from "@commons/models/type/Type";
import {useStats} from "../../hooks/useStats";
import {useType} from "../../hooks/useType";
import OfflineBanner from "../../components/ThemedOfflineBanner";
import {useAlertExitApp} from "../../hooks/useAlertExitApp";

const Dashboard = () => {
    const {t} = useTranslation();

    const {
        getOverviewStats,
        getStatsReportByType,
        getStatsReportByStatus,
        getStatsOccurrenceByImportance,
        getStatsReportByTypeThisMonth,
        getStatsReportByStatusThisMonth,
        getStatsOccurrenceByImportanceThisMonth
    } = useStats()
    const {type} = useType()
    const [loading, setLoading] = useState(true)
    const [overview, setOverview] = useState<OverviewStats | null>(null)
    const [byType, setByType] = useState<StatsReportType[]>([])
    const [byStatus, setByStatus] = useState<StatsReportStatus[]>([])
    const [byImportance, setByImportance] = useState<StatsOccurrenceImportance[]>([])
    const [byTypeMonth, setByTypeMonth] = useState<StatsReportType[]>([])
    const [byStatusMonth, setByStatusMonth] = useState<StatsReportStatus[]>([])
    const [byImportanceMonth, setByImportanceMonth] = useState<StatsOccurrenceImportance[]>([])

    useAlertExitApp()

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true)
                const [overviewRes, typeRes, statusRes, importanceRes, typeMonthRes, statusMonthRes, importanceMonthRes] =
                    await Promise.all([
                        getOverviewStats(),
                        getStatsReportByType(),
                        getStatsReportByStatus(),
                        getStatsOccurrenceByImportance(),
                        getStatsReportByTypeThisMonth(),
                        getStatsReportByStatusThisMonth(),
                        getStatsOccurrenceByImportanceThisMonth(),
                    ])
                if (cancelled) return
                setOverview(overviewRes)
                setByType(typeRes)
                setByStatus(statusRes)
                setByImportance(importanceRes)
                setByTypeMonth(typeMonthRes)
                setByStatusMonth(statusMonthRes)
                setByImportanceMonth(importanceMonthRes)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()
        return () => {
            cancelled = true
        }
    }, [])

    if (loading) {
        return (
            <ThemedView safe={true} style={styles.container}>
                <ThemedLoader/>
            </ThemedView>
        );
    }

    const getTypeLabel = (typeId: number) => {
        const found = (type ?? []).find((tp) => tp.id === typeId)
        return `${found?.name}`
    };

    console.log(type)

    return (
        <ThemedView safe={true} style={styles.container}>
            <ScrollView>
                <Spacer/>
                <ThemedText title={true} style={styles.heading}>
                    {t("dashboard.dashboard")}
                </ThemedText>

                <OfflineBanner/>

                <Spacer/>

                <ThemedView style={styles.grid}>
                    <ThemedCard style={styles.kpiCard}>
                        <ThemedText style={styles.label}>{t("stats.totalUsers")}</ThemedText>
                        <ThemedText style={styles.value}>{overview?.totalUsers ?? `—`}</ThemedText>
                    </ThemedCard>
                    <ThemedCard style={styles.kpiCard}>
                        <ThemedText style={styles.label}>{t("stats.totalOccurrences")}</ThemedText>
                        <ThemedText style={styles.value}>{overview?.totalOccurrences ?? `—`}</ThemedText>
                    </ThemedCard>
                    <ThemedCard style={styles.kpiCard}>
                        <ThemedText style={styles.label}>{t("stats.totalReports")}</ThemedText>
                        <ThemedText style={styles.value}>{overview?.totalReports ?? `—`}</ThemedText>
                    </ThemedCard>
                    <ThemedCard style={styles.kpiCard}>
                        <ThemedText style={styles.label}>{t("stats.totalEvidences")}</ThemedText>
                        <ThemedText style={styles.value}>{overview?.totalEvidences ?? `—`}</ThemedText>
                    </ThemedCard>
                </ThemedView>

                <Spacer/>

                <ThemedText title={true} style={styles.title}>{t("stats.global")}</ThemedText>

                <BarChartCard
                    title={t("stats.reportsByType")}
                    rows={byType.map((x) => ({
                        label: `${getTypeLabel(x.type)}`,
                        count: x.count,
                        percentage: x.percentage,
                    }))}
                />

                <BarChartCard
                    title={t("stats.reportsByStatus")}
                    rows={byStatus.map((x) => ({
                        label: t(`reportStatus.${x.status}`) ?? String(x.status),
                        count: x.count,
                        percentage: x.percentage,
                    }))}
                />

                <BarChartCard
                    title={t("stats.occurrencesByImportance")}
                    rows={byImportance.map((x) => ({
                        label: t(`importance.${x.importance}`),
                        count: x.count,
                        percentage: x.percentage,
                    }))}
                />

                <Spacer/>

                <ThemedText title={true} style={styles.title}>{t("stats.thisMonth")}</ThemedText>

                <BarChartCard
                    title={t("stats.reportsByType")}
                    rows={byTypeMonth.map((x) => ({
                        label: `${getTypeLabel(x.type)}`,
                        count: x.count,
                        percentage: x.percentage,
                    }))}
                />

                <BarChartCard
                    title={t("stats.reportsByStatus")}
                    rows={byStatusMonth.map((x) => ({
                        label: t(`reportStatus.${x.status}`) ?? String(x.status),
                        count: x.count,
                        percentage: x.percentage,
                    }))}
                />

                <BarChartCard
                    title={t("stats.occurrencesByImportance")}
                    rows={byImportanceMonth.map((x) => ({
                        label: t(`importance.${x.importance}`),
                        count: x.count,
                        percentage: x.percentage,
                    }))}
                />
            </ScrollView>
        </ThemedView>
    )
}

export default Dashboard;

type ChartRow = {
    label: string;
    count: number;
    percentage: number;
}

function BarChartCard({title, rows}: { title: string; rows: ChartRow[] }) {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light
    return (
        <ThemedCard style={styles.chartCard}>
            <ThemedText style={styles.chartTitle}>{title}</ThemedText>

            {rows.length === 0 ? (
                <ThemedText style={styles.emptyText}>—</ThemedText>
            ) : (
                <ThemedView style={[styles.chartRow, {backgroundColor: theme.uiBackground}]}>
                    {rows
                        .slice()
                        .sort((a, b) => b.count - a.count)
                        .map((row) => (
                            <ThemedView key={row.label} style={[styles.chartRow, {backgroundColor: theme.uiBackground}]}>
                                <ThemedText style={styles.rowLabel}>{row.label}</ThemedText>

                                <ThemedView style={[styles.barTrack, {backgroundColor: theme.uiBackground}]}>
                                    <ThemedView
                                        style={[
                                            styles.barFill,
                                            {
                                                width: `${Math.max(0, Math.min(100, row.percentage))}%`,
                                                backgroundColor: Colors.primary,
                                            },
                                        ]}
                                    />
                                </ThemedView>

                                <ThemedText style={styles.rowValue}>
                                    {row.count} ({row.percentage}%)
                                </ThemedText>
                            </ThemedView>
                        ))}
                </ThemedView>
            )}
        </ThemedCard>
    );
}

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

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 12,
        gap: 12,
        justifyContent: "space-between",
    },
    kpiCard: {
        width: "48%",
        padding: 14,
        borderLeftColor: Colors.primary,
        borderLeftWidth: 4,
    },
    label: {
        fontSize: 12,
        opacity: 0.85,
        marginBottom: 6,
    },
    value: {
        fontSize: 22,
        fontWeight: "700",
    },

    title: {
        fontSize: 16,
        fontWeight: "700",
        marginHorizontal: 16,
        marginBottom: 10,
        marginTop: 6,
    },

    chartCard: {
        marginHorizontal: 16,
        marginVertical: 10,
        padding: 14,
        borderLeftColor: Colors.primary,
        borderLeftWidth: 4,
    },
    chartTitle: {
        fontSize: 14,
        fontWeight: "700",
        marginBottom: 12,
    },
    emptyText: {
        opacity: 0.7,
    },
    chartRows: {
        gap: 10,
    },
    chartRow: {
        gap: 6,
    },
    rowLabel: {
        fontSize: 13,
        fontWeight: "600",
    },
    barTrack: {
        height: 10,
        borderRadius: 8,
        overflow: "hidden",
    },
    barFill: {
        height: "100%",
        borderRadius: 8,
    },
    rowValue: {
        fontSize: 12,
        opacity: 0.85,
    },
});