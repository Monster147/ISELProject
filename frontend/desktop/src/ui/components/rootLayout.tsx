import {useColorScheme} from "react-native";
import {Colors} from "@commons/constants/Colors";
import {AuthProvider} from "../contexts/AuthContext";
import ThemedView from "../../../components/ThemedView";
import {OccurrenceProvider} from "../contexts/OccurrenceContext";
import {IntervenorProvider} from "../contexts/IntervenorContext";
import {Outlet, useNavigate} from "react-router";
import {useConfirm} from "../hooks/useConfirm";
import ConfirmModal from "./ConfirmModal";
import {useEffect, useState} from "react";
import {useNetworkStatus} from "../../hooks/useNetworkStatus";
import {useConfirmAction} from "../utils/confirmAction";
import {useTranslation} from "react-i18next";
import {DocumentProvider} from "../contexts/DocumentContext";
import {TypeProvider} from "../contexts/TypeContext";
import {EvidenceProvider} from "../contexts/EvidenceContext";
import {StatsProvider} from "../contexts/StatsContext";
import {ReportProvider} from "../contexts/ReportContext";

const RootLayoutContent = () => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light;
    const {dialog, confirm} = useConfirm()
    const navigate = useNavigate();
    const loadingScreen = window.location.pathname === "/"
    const {t} = useTranslation()

    const {isOnline} = useNetworkStatus();

    useEffect(() => {
        console.log("isOnline:", isOnline);
        if (!isOnline && !loadingScreen) {
            confirm({
                title: t("offline.title"),
                message: t("offline.message"),
                confirmText: t("offline.confirm"),
            }).then(() => {
                navigate("/")
            })
        }
    }, [isOnline]);


    return (
        <ThemedView style={{flex: 1, backgroundColor: theme.background}}>
            <Outlet/>
            {dialog?.options && (
                <ConfirmModal
                    visible={true}
                    title={dialog.options.title}
                    message={dialog.options.message}
                    confirmText={dialog.options.confirmText}
                    cancelText={dialog.options.cancelText}
                    onConfirm={dialog.onConfirm}
                    onCancel={dialog.onCancel}
                />
            )}
        </ThemedView>
    )
}

const RootLayout = () => {
    return (
        <AuthProvider>
            <OccurrenceProvider>
                <IntervenorProvider>
                    <DocumentProvider>
                        <TypeProvider>
                            <EvidenceProvider>
                                <StatsProvider>
                                    <ReportProvider>
                                        <RootLayoutContent/>
                                    </ReportProvider>
                                </StatsProvider>
                            </EvidenceProvider>
                        </TypeProvider>
                    </DocumentProvider>
                </IntervenorProvider>
            </OccurrenceProvider>
        </AuthProvider>
    )
}

export default RootLayout

