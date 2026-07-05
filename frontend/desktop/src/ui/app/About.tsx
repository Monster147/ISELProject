import { StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import ThemedView from "@components/ThemedView";
import ThemedText from "@commons/components/ThemedText";
import React from "react";
import Spacer from "@commons/components/Spacer";
import { Link } from "react-router";
import ThemedCard from "@commons/components/ThemedCard";

const About = () => {
  const { t } = useTranslation();

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
      <Spacer height={10} />
      <Link to="/home">
        <ThemedText style={{ textAlign: "center" }}>
          {t("home.home")}
        </ThemedText>
      </Link>
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
