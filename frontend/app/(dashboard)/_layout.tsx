import {StatusBar, StyleSheet, Text, useColorScheme, View} from "react-native";
import {Stack, Tabs} from "expo-router";
import {Colors} from "../../constants/Colors";
import {Ionicons} from "@expo/vector-icons";
import UserOnly from "../../components/auth/UserOnly";

const DashboardLayout = () => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

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
                    name="occurrence"
                    options={{
                        title: 'Occurrence',
                        tabBarIcon: ({focused}) =>
                            <Ionicons
                                size={24}
                                name={focused ? 'alert-circle' : 'alert-circle-outline'}
                                color={focused ? theme.iconColorFocused : theme.iconColor}
                            />
                    }}/>
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
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
                    name="occurrences/intervenors/[id]"
                    options={{href: null}}
                />
                <Tabs.Screen
                    name="occurrences/intervenors/update/[id]"
                    options={{href: null}}
                />
                <Tabs.Screen
                    name="occurrences/intervenors/create"
                    options={{href: null}}
                />
            </Tabs>
        </UserOnly>
    )
}

export default DashboardLayout

const styles = StyleSheet.create({})
