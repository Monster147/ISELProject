import { Outlet, NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { useColorScheme, View, Text, StyleSheet } from "react-native";
import { Colors } from "@commons/constants/Colors";
import UserOnly from "../../../../components/auth/UserOnly";
import { MdGroups, MdGroups2, MdErrorOutline, MdError, MdPersonOutline, MdPerson } from "react-icons/md";
import RootLayout from "../rootLayout";

const DashboardLayout = () => {
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    return (
        <UserOnly>
            <View style={[styles.container, { backgroundColor: theme.navBackground }]}>
                <View style={styles.content}>
                    <Outlet />
                </View>

                <View style={[styles.tabBar, { backgroundColor: theme.navBackground }]}>
                    <TabItem
                        to="/intervenor"
                        label={t("dashboard.intervenor")}
                        activeIcon={<MdGroups size={24} color={theme.iconColorFocused} />}
                        inactiveIcon={<MdGroups2 size={24} color={theme.iconColor} />}
                        textColorActive={theme.iconColorFocused}
                        textColorInactive={theme.iconColor}
                    />

                    <TabItem
                        to="/occurrence"
                        label={t("dashboard.occurrence")}
                        activeIcon={<MdError size={24} color={theme.iconColorFocused} />}
                        inactiveIcon={<MdErrorOutline size={24} color={theme.iconColor} />}
                        textColorActive={theme.iconColorFocused}
                        textColorInactive={theme.iconColor}
                    />

                    <TabItem
                        to="/profile"
                        label={t("dashboard.profile")}
                        activeIcon={<MdPerson size={24} color={theme.iconColorFocused} />}
                        inactiveIcon={<MdPersonOutline size={24} color={theme.iconColor} />}
                        textColorActive={theme.iconColorFocused}
                        textColorInactive={theme.iconColor}
                    />
                </View>
            </View>
        </UserOnly>
    );
}

export default DashboardLayout

function TabItem({
                     to,
                     label,
                     activeIcon,
                     inactiveIcon,
                     textColorActive,
                     textColorInactive,
                 }: {
    to: string;
    label: string;
    activeIcon: React.ReactNode;
    inactiveIcon: React.ReactNode;
    textColorActive: string;
    textColorInactive: string;
}) {
    return (
        <NavLink
            to={to}
            style={({ isActive }) => ({
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 12,
                opacity: isActive ? 1 : 0.75,
                textDecoration: "none",
            })}
        >
            {({ isActive }) => (
                <>
                    {isActive ? activeIcon : inactiveIcon}
                    <Text style={{ color: isActive ? textColorActive : textColorInactive, fontSize: 12 }}>
                        {label}
                    </Text>
                </>
            )}
        </NavLink>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1 },
    tabBar: {
        height: 90,
        flexDirection: "row",
        paddingTop: 10,
    },
});