import {StyleSheet, Text, useColorScheme, View} from "react-native";
import {Stack} from "expo-router";
import {Colors} from "@commons/constants/Colors";
import {AuthProvider} from "../contexts/AuthContext";
import ThemedView from "../components/ThemedView";
import {OccurrenceProvider} from "../contexts/OccurrenceContext";
import {IntervenorProvider} from "../contexts/IntervenorContext";
import "../i18next/i18next"
import "../utils/ConfigureApiMobile"
import {DocumentProvider} from "../contexts/DocumentContext";

const RootLayout = () => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <AuthProvider>
            <OccurrenceProvider>
                <IntervenorProvider>
                    <DocumentProvider>
                        <ThemedView style={{flex: 1}}>
                            <Stack screenOptions={{
                                headerStyle: {backgroundColor: theme.navBackground},
                                headerTintColor: theme.title,
                                contentStyle: {backgroundColor: theme.background},
                                animation: "none",
                            }}>
                                <Stack.Screen name="loadingscreen" options={{headerShown: false}}/>
                                <Stack.Screen name="about" options={{headerShown: false}}/>
                                <Stack.Screen name="contact" options={{headerShown: false}}/>
                                <Stack.Screen name="(auth)" options={{headerShown: false}}/>
                                <Stack.Screen name="(dashboard)" options={{headerShown: false}}/>
                                <Stack.Screen name="home" options={{headerShown: false}}/>
                            </Stack>
                        </ThemedView>
                    </DocumentProvider>
                </IntervenorProvider>
            </OccurrenceProvider>
        </AuthProvider>
    )
}

export default RootLayout

const styles = StyleSheet.create({})