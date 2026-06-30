import { StyleSheet } from "react-native";
import { router } from "expo-router";
import ThemedView from "@components/ThemedView";
import ThemedText from "@commons/components/ThemedText";
import { useBackRedirect } from "@hooks/system/useBackRedirect";
import OfflineBanner from "@components/ThemedOfflineBanner";


/**
 * Ecrã de contacto da aplicação móvel.
 * Apresenta a informação de contacto e o aviso de estado offline.
 * Redireciona para o ecrã inicial quando o utilizador carrega no botão de retroceder.
 */
const Contact = () => {
  useBackRedirect(() => router.navigate(`/home`));

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title} title={true}>
        Contact Page
      </ThemedText>
      <OfflineBanner />
    </ThemedView>
  );
};

export default Contact;

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
