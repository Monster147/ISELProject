import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { Stack } from "expo-router";
import { Colors } from "@commons/constants/Colors";
import GuestOnly from "../../components/auth/GuestOnly";
import ThemedView from "../../components/ThemedView";
import "../../i18next/i18next";

const AuthLayout = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <GuestOnly>
      <ThemedView style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.navBackground },
            headerTintColor: theme.title,
            contentStyle: { backgroundColor: theme.background },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
        </Stack>
      </ThemedView>
    </GuestOnly>
  );
};

export default AuthLayout;

const styles = StyleSheet.create({});
