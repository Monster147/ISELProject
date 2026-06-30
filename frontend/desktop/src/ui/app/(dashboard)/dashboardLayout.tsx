import { Outlet, NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { useColorScheme, View, Text, StyleSheet } from "react-native";
import { Colors } from "@commons/constants/Colors";
import UserOnly from "@components/auth/UserOnly";
import {
  MdGroups,
  MdGroups2,
  MdErrorOutline,
  MdError,
  MdPersonOutline,
  MdPerson,
  MdDescription,
  MdOutlineDescription,
  MdInsights,
  MdOutlineInsights,
} from "react-icons/md";
import ThemedView from "@components/ThemedView";

/**
 * Layout do dashboard com barra de navegação (versão desktop/web).
 * Protege as rotas com `UserOnly` (apenas utilizadores autenticados) e renderiza a rota ativa
 * (`Outlet`) acima de uma barra com os separadores de intervenientes, dashboard, ocorrências,
 * documentos e perfil.
 */
const DashboardLayout = () => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <UserOnly>
      <ThemedView
        style={[styles.container, { backgroundColor: theme.navBackground }]}
      >
        <ThemedView style={styles.content}>
          <Outlet />
        </ThemedView>

        <ThemedView
          style={[styles.tabBar, { backgroundColor: theme.navBackground }]}
        >
          <TabItem
            to="/intervenor"
            label={t("dashboard.intervenor")}
            activeIcon={<MdGroups size={24} color={theme.iconColorFocused} />}
            inactiveIcon={<MdGroups2 size={24} color={theme.iconColor} />}
            textColorActive={theme.iconColorFocused}
            textColorInactive={theme.iconColor}
          />

          <TabItem
            to="/dashboard"
            label={t("dashboard.dashboard")}
            activeIcon={<MdInsights size={24} color={theme.iconColorFocused} />}
            inactiveIcon={
              <MdOutlineInsights size={24} color={theme.iconColor} />
            }
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
            to="/documents"
            label={t("dashboard.documents")}
            activeIcon={
              <MdDescription size={24} color={theme.iconColorFocused} />
            }
            inactiveIcon={
              <MdOutlineDescription size={24} color={theme.iconColor} />
            }
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
        </ThemedView>
      </ThemedView>
    </UserOnly>
  );
};

export default DashboardLayout;

function TabItem({
  to,
  label,
  activeIcon,
  inactiveIcon,
  textColorActive,
  textColorInactive,
}) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        paddingHorizontal: 12,
        opacity: isActive ? 1 : 0.75,
        textDecoration: "none",
        borderRadius: 8,
        marginVertical: 4,
      })}
    >
      {({ isActive }) => (
        <View style={styles.sidebarItemContent}>
          {isActive ? activeIcon : inactiveIcon}
          <Text
            style={{
              color: isActive ? textColorActive : textColorInactive,
              fontSize: 14,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            {label}
          </Text>
        </View>
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
  sidebarItemContent: {
    alignItems: "center",
    justifyContent: "center",
  },
});
