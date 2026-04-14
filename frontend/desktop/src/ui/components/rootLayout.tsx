import { useColorScheme } from "react-native";
import {Colors} from "@commons/constants/Colors";
import {AuthProvider} from "../contexts/AuthContext";
import ThemedView from "../../../components/ThemedView";
import {OccurrenceProvider} from "../contexts/OccurrenceContext";
import {IntervenorProvider} from "../contexts/IntervenorContext";
import {Outlet} from "react-router";
import {useConfirm} from "../hooks/useConfirm";
import ConfirmModal from "./ConfirmModal";

const RootLayoutContent = () => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light;
    const { dialog } = useConfirm();

    return (
        <ThemedView style={{flex: 1, backgroundColor: theme.background}}>
            <Outlet/>
            {dialog && (
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
                    <RootLayoutContent/>
                </IntervenorProvider>
            </OccurrenceProvider>
        </AuthProvider>
    )
}

export default RootLayout

