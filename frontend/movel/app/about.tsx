import { StyleSheet } from "react-native";
import { router } from "expo-router";
import ThemedView from "@components/ThemedView";
import ThemedText from "@commons/components/ThemedText";
import { useBackRedirect } from "@hooks/system/useBackRedirect";
import OfflineBanner from "@components/ThemedOfflineBanner";

/**
 * Ecrã "Sobre" da aplicação móvel.
 * Apresenta informação sobre a aplicação e o aviso de estado offline.
 * Redireciona para o ecrã inicial quando o utilizador carrega no botão de retroceder.
 */
const About = () => {
  useBackRedirect(() => router.navigate(`/home`));

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title} title={true}>
        About Page
      </ThemedText>
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
  link: {
    marginVertical: 10,
    borderBottomWidth: 1,
  },
});
