import {StyleSheet, Text, useColorScheme, View} from "react-native";
import {Colors} from "@commons/constants/Colors";
import {AuthProvider} from "../contexts/AuthContext";
import ThemedView from "../../../components/ThemedView";
import {OccurrenceProvider} from "../contexts/OccurrenceContext";
import {IntervenorProvider} from "../contexts/IntervenorContext";
import {Outlet} from "react-router";

const RootLayout = () => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <AuthProvider>
            <OccurrenceProvider>
                <IntervenorProvider>
                    <ThemedView style={{flex: 1, backgroundColor: theme.background}}>
                        <Outlet />
                    </ThemedView>
                </IntervenorProvider>
            </OccurrenceProvider>
        </AuthProvider>
    )
}

export default RootLayout

const styles = StyleSheet.create({})