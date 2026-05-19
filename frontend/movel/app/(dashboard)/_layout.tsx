import {StatusBar, StyleSheet, Text, useColorScheme, View} from "react-native";
import { Stack, Tabs, useRouter} from "expo-router";
import {Colors} from "@commons/constants/Colors";
import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import UserOnly from "../../components/auth/UserOnly";
import "../../i18next/i18next"
import {useTranslation} from "react-i18next";

const DashboardLayout = () => {
    const {t} = useTranslation()
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light
    const router = useRouter();

    return (
        <UserOnly>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: theme.navBackground,
                        paddingTop: 10,
                        height: 90,
                    },
                    tabBarActiveTintColor: theme.iconColorFocused,
                    tabBarInactiveTintColor: theme.iconColor,
                }}
            >
                <Tabs.Screen
                    name="intervenor"
                    options={{
                        title: t("dashboard.intervenor"),
                        tabBarIcon: ({focused}) =>
                            <MaterialCommunityIcons
                                size={24}
                                name={focused ? 'account-group' : 'account-group-outline'}
                                color={focused ? theme.iconColorFocused : theme.iconColor}
                            />
                    }}
                    listeners={{
                        tabPress:(e)=>{
                            e.preventDefault()
                            router.replace(`/intervenor`)
                        }
                    }}
                />
                <Tabs.Screen
                    name="dashboard"
                    options={{
                        title: t("dashboard.dashboard"),
                        tabBarIcon: ({ focused }) => (
                            <MaterialCommunityIcons
                                size={24}
                                name={focused ? "chart-box" : "chart-box-outline"}
                                color={focused ? theme.iconColorFocused : theme.iconColor}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="occurrence"
                    options={{
                        title: t("dashboard.occurrence"),
                        tabBarIcon: ({focused}) =>
                            <Ionicons
                                size={24}
                                name={focused ? 'alert-circle' : 'alert-circle-outline'}
                                color={focused ? theme.iconColorFocused : theme.iconColor}
                            />
                    }}/>
                <Tabs.Screen
                    name={"documents"}
                    options={{
                        title: t("dashboard.documents"),
                        tabBarIcon: ({focused}) =>
                            <Ionicons
                                size={24}
                                name={focused ? 'document' : 'document-outline'}
                                color={focused ? theme.iconColorFocused : theme.iconColor}
                            />
                    }}/>
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: t("dashboard.profile"),
                        tabBarIcon: ({focused}) =>
                            <Ionicons
                                size={24}
                                name={focused ? 'person' : 'person-outline'}
                                color={focused ? theme.iconColorFocused : theme.iconColor}
                            />
                    }}/>
                <Tabs.Screen
                    name="occurrences/[id]"
                    options={{href: null}}
                />
                <Tabs.Screen
                    name="intervenors/[id]"
                    options={{href: null}}
                />
                <Tabs.Screen
                    name="intervenors/create"
                    options={{href: null}}
                />
                <Tabs.Screen
                    name="occurrences/intervenors/[id]"
                    options={{href: null}}
                />
                <Tabs.Screen
                    name="occurrences/evidences/[id]"
                    options={{href: null}}
                />
                <Tabs.Screen
                    name="occurrences/evidences/FieldRenderer"
                    options={{href: null}}
                />
            </Tabs>
        </UserOnly>
    )
}

export default DashboardLayout

const styles = StyleSheet.create({})
