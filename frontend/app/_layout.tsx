import {StyleSheet, Text, useColorScheme, View} from "react-native";
import {Stack} from "expo-router";
import {Colors} from "../constants/Colors";
import {AuthProvider} from "../contexts/AuthContext";
import ThemedView from "../components/ThemedView";


const RootLayout = () => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <AuthProvider>
            <ThemedView style={{flex: 1}}>
                <Stack screenOptions={{
                    headerStyle: {backgroundColor: theme.navBackground},
                    headerTintColor: theme.title,
                    contentStyle: {backgroundColor: theme.background},
                    animation: "none",
                }}>
                    <Stack.Screen name="loadingscreen" options={{headerShown: false}}/>
                    <Stack.Screen name="about" options={{title: 'About'}}/>
                    <Stack.Screen name="contact" options={{title: 'Contact'}}/>
                    <Stack.Screen name="(auth)" options={{headerShown: false}}/>
                    <Stack.Screen name="(dashboard)" options={{headerShown: false}}/>
                    <Stack.Screen name="home" options={{title: 'Home'}}/>
                </Stack>
            </ThemedView>
        </AuthProvider>
    )
}

export default RootLayout

const styles = StyleSheet.create({})