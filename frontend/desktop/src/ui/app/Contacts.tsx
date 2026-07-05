import { Pressable, StyleSheet, Image, useColorScheme } from "react-native";
import { useTranslation } from "react-i18next";
import ThemedView from "@components/ThemedView";
import Spacer from "@commons/components/Spacer";
import ThemedText from "@commons/components/ThemedText";
import { Link } from "react-router";
import React from "react";
import Afonso from "@commons/img/afonso.png";
import Jose from "@commons/img/jose.png";
import ThemedCard from "@commons/components/ThemedCard";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { Colors } from "@commons/constants/Colors";

const Contacts = () => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

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
            <Pressable
              onPress={() =>
                window.electron.openExternal("https://github.com/Monster147")
              }
            >
              <FaGithub size={28} />
            </Pressable>

            <Pressable
              onPress={() =>
                window.electron.openExternal(
                  "https://www.linkedin.com/in/jos%C3%A9-saldanha-078525290/",
                )
              }
            >
              <FaLinkedin size={28} color="#0077B5" />
            </Pressable>

            <Pressable
              onPress={() =>
                (window.location.href = "mailto:A51445@alunos.isel.pt")
              }
            >
              <MdEmail size={28} color="#D44638" />
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
            <Pressable
              onPress={() =>
                window.electron.openExternal("https://github.com/AJesus1227")
              }
            >
              <FaGithub size={28} />
            </Pressable>

            <Pressable
              onPress={() =>
                window.electron.openExternal(
                  "https://www.linkedin.com/in/afonso-jesus-a14890384/",
                )
              }
            >
              <FaLinkedin size={28} color="#0077B5" />
            </Pressable>

            <Pressable
              onPress={() =>
                (window.location.href = "mailto:A51561@alunos.isel.pt")
              }
            >
              <MdEmail size={28} color="#D44638" />
            </Pressable>
          </ThemedView>
        </ThemedCard>
      </ThemedView>

      <Spacer height={20} />

      <Link to="/home">
        <ThemedText style={{ textAlign: "center" }}>
          {t("home.home")}
        </ThemedText>
      </Link>
    </ThemedView>
  );
};

export default Contacts;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  cardsContainer: {
    flexDirection: "row",
    gap: 20,
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
