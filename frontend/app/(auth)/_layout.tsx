import {StatusBar, StyleSheet, Text, useColorScheme, View} from "react-native";
import {Stack} from "expo-router";
import {Colors} from "../../constants/Colors";

const AuthLayout = () => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <>
            <StatusBar value="auto"/>
            <Stack screenOptions={{
                headerStyle: {backgroundColor: theme.navBackground},
                headerTintColor: theme.title,
                animation: "none"
            }}>
                <Stack.Screen name="login" options={{title: 'Login'}}/>
                <Stack.Screen name="register" options={{title: 'Register'}}/>
            </Stack>
        </>
    )
}

export default AuthLayout

const styles = StyleSheet.create({})