import {StatusBar, StyleSheet, Text, useColorScheme, View} from "react-native";
import {Stack} from "expo-router";
import {Colors} from "../constants/Colors";
import {AuthProvider} from "../contexts/AuthContext";

const RootLayout = () => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <AuthProvider>
            <StatusBar value="auto"/>
            <Stack screenOptions={{
                headerStyle: {backgroundColor: theme.navBackground},
                headerTintColor: theme.title,
                contentStyle: {backgroundColor: theme.background},
            }}>
                <Stack.Screen name="loadingscreen" options={{headerShown: false}}/>
                <Stack.Screen name="about" options={{title: 'About'}}/>
                <Stack.Screen name="contact" options={{title: 'Contact'}}/>
                <Stack.Screen name="(auth)" options={{headerShown: false}}/>
                <Stack.Screen name="(dashboard)" options={{headerShown: false}}/>
                <Stack.Screen name="home" options={{title: 'Home'}}/>
            </Stack>
        </AuthProvider>
    )
}

export default RootLayout

const styles = StyleSheet.create({})