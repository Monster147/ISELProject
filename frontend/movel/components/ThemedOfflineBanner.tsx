import { View, StyleSheet } from "react-native";
import { useColorScheme } from "react-native";
import { Colors } from "@commons/constants/Colors";
import ThemedText from "@commons/components/ThemedText";
import { useNetworkStatus } from "@hooks/system/useNetworkStatus";
import { useTranslation } from "react-i18next";

/**
 * Banner de aviso de ausência de conectividade para a plataforma móvel.
 * Renderiza um banner no topo do ecrã quando o dispositivo está offline.
 * Não renderiza nada enquanto o estado de rede estiver online ou indeterminado.
 */
const OfflineBanner = () => {
  const { t } = useTranslation();
  const { isOnline } = useNetworkStatus();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  if (isOnline !== false) return null;

  return (
    <View style={[styles.container, { backgroundColor: Colors.warning }]}>
      <ThemedText style={styles.text}>{t("warning.noConnection")}</ThemedText>
    </View>
  );
};

export default OfflineBanner;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 14,
  },
});
