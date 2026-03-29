import {StatusBar, StyleSheet, Text, useColorScheme, View} from "react-native";
import {Stack} from "expo-router";
import {Colors} from "../../constants/Colors";
import GuestOnly from "../../components/auth/GuestOnly";

const AuthLayout = () => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <GuestOnly>
            <StatusBar value="auto"/>
            <Stack screenOptions={{
                headerStyle: {backgroundColor: theme.navBackground},
                headerTintColor: theme.title,
                contentStyle: {backgroundColor: theme.background},
                animation: "slide_from_right",
            }}>
                <Stack.Screen name="login" options={{title: 'Login'}}/>
                <Stack.Screen name="register" options={{title: 'Register'}}/>
            </Stack>
        </GuestOnly>
    )
}

export default AuthLayout

const styles = StyleSheet.create({})