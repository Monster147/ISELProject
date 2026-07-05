import {
  Pressable,
  StyleSheet,
  Image,
  useColorScheme,
  Linking,
} from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import ThemedView from "@components/ThemedView";
import ThemedText from "@commons/components/ThemedText";
import { useBackRedirect } from "@hooks/system/useBackRedirect";
import OfflineBanner from "@components/ThemedOfflineBanner";
import { Colors } from "@commons/constants/Colors";
import ThemedCard from "@commons/components/ThemedCard";
import Spacer from "@commons/components/Spacer";
import Afonso from "@commons/img/afonso.png";
import Jose from "@commons/img/jose.png";

/**
 * Ecrã de contacto da aplicação móvel.
 * Apresenta a informação de contacto e o aviso de estado offline.
 * Redireciona para o ecrã inicial quando o utilizador carrega no botão de retroceder.
 */
const Contact = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  useBackRedirect(() => router.navigate(`/home`));

  const openUrl = async (url: string) => {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.cardsContainer}>
        <ThemedCard style={styles.card}>
          <Image source={Jose} style={styles.image} />

          <Spacer height={10} />

          <ThemedText style={styles.name}>José Saldanha</ThemedText>

          <ThemedView
            style={[
              styles.iconsContainer,
              { backgroundColor: theme.uiBackground },
            ]}
          >
            <Pressable onPress={() => openUrl("https://github.com/Monster147")}>
              <FontAwesome name="github" size={28} color={theme.text} />
            </Pressable>

            <Pressable
              onPress={() =>
                openUrl(
                  "https://www.linkedin.com/in/jos%C3%A9-saldanha-078525290/",
                )
              }
            >
              <FontAwesome name="linkedin-square" size={28} color="#0077B5" />
            </Pressable>

            <Pressable onPress={() => openUrl("mailto:A51445@alunos.isel.pt")}>
              <MaterialIcons name="email" size={28} color="#D44638" />
            </Pressable>
          </ThemedView>
        </ThemedCard>

        <ThemedCard style={styles.card}>
          <Image source={Afonso} style={styles.image} />

          <Spacer height={10} />

          <ThemedText style={styles.name}>Afonso Jesus</ThemedText>

          <ThemedView
            style={[
              styles.iconsContainer,
              { backgroundColor: theme.uiBackground },
            ]}
          >
            <Pressable onPress={() => openUrl("https://github.com/AJesus1227")}>
              <FontAwesome name="github" size={28} color={theme.text} />
            </Pressable>

            <Pressable
              onPress={() =>
                openUrl("https://www.linkedin.com/in/afonso-jesus-a14890384/")
              }
            >
              <FontAwesome name="linkedin-square" size={28} color="#0077B5" />
            </Pressable>

            <Pressable onPress={() => openUrl("mailto:A51561@alunos.isel.pt")}>
              <MaterialIcons name="email" size={28} color="#D44638" />
            </Pressable>
          </ThemedView>
        </ThemedCard>
      </ThemedView>
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
    padding: 20,
  },

  cardsContainer: {
    flexDirection: "column",
    gap: 20,
    alignItems: "center",
  },

  card: {
    width: 220,
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
  },

  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },

  iconsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    marginTop: 12,
  },
});
