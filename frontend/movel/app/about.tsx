import { StyleSheet } from "react-native";
import { router } from "expo-router";
import ThemedView from "@components/ThemedView";
import ThemedText from "@commons/components/ThemedText";
import { useBackRedirect } from "@hooks/system/useBackRedirect";
import OfflineBanner from "@components/ThemedOfflineBanner";
import ThemedCard from "@commons/components/ThemedCard";
import Spacer from "@commons/components/Spacer";
import { useTranslation } from "react-i18next";

/**
 * Ecrã "Sobre" da aplicação móvel.
 * Apresenta informação sobre a aplicação e o aviso de estado offline.
 * Redireciona para o ecrã inicial quando o utilizador carrega no botão de retroceder.
 */
const About = () => {
  const { t } = useTranslation();
  useBackRedirect(() => router.navigate(`/home`));

  return (
    <ThemedView style={styles.container}>
      <ThemedCard style={styles.cart}>
        <ThemedText>{t("about.intro")}</ThemedText>
        <Spacer height={10} />
        <ThemedText>{t("about.market")}</ThemedText>
        <Spacer height={10} />
        <ThemedText>{t("about.conclusion")}</ThemedText>
        <Spacer height={10} />
        <ThemedText>{t("about.authors")}</ThemedText>
      </ThemedCard>
      <OfflineBanner />
    </ThemedView>
  );
};

export default About;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    color: "purple",
  },
  cart: {
    padding: 20,
    borderRadius: 5,
    boxShadow: "4px 4px rgba(0,0,0,0.1)",
    maxWidth: 900,
    width: "85%",
  },
  link: {
    marginVertical: 10,
    borderBottomWidth: 1,
  },
});
