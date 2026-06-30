import React, { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Animated, Easing } from "react-native";
import { useAuth } from "@hooks/data/useAuth";
import Logo from "@commons/img/isel.png";
import AppLogo from "@commons/img/logo.png";
import ThemedView from "@components/ThemedView";
import ThemedText from "@commons/components/ThemedText";
import Spacer from "@commons/components/Spacer";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useNetworkStatus } from "@hooks/system/useNetworkStatus";
import { useConfirm } from "@hooks/system/useConfirm";

const DURATION_MS = 4000;

/**
 * Ecrã de arranque (versão desktop/web).
 * Anima uma barra de progresso durante `DURATION_MS` e, quando termina e o estado de autenticação
 * já está resolvido, encaminha o utilizador: para as ocorrências se tiver sessão, para o início caso contrário.
 * Se estiver offline, mostra um aviso e recarrega a aplicação após confirmação.
 */
const Loadingscreen = () => {
  const { t } = useTranslation();
  const { token, isAuthLoading } = useAuth();
  const { confirm } = useConfirm();
  const navigate = useNavigate();

  const progress = useRef(new Animated.Value(0)).current;
  const [animationDone, setAnimationDone] = useState(false);

  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    });

    anim.start(({ finished }) => {
      if (finished) setAnimationDone(true);
    });

    return () => {
      anim.stop();
    };
  }, [progress]);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const finished = !isAuthLoading && animationDone;

  useEffect(() => {
    if (!finished) return;

    if (isOnline) {
      if (token) navigate("/occurrence");
      else navigate("/home");
    } else {
      confirm({
        title: t("offline.title"),
        message: t("offline.message"),
        confirmText: t("offline.confirm"),
      }).then(() => {
        window.location.reload();
      });
    }
  }, [finished, isOnline]);

  return (
    <ThemedView style={styles.container}>
      <Image
        source={Logo}
        style={{ width: 400, height: 200, resizeMode: "cover" }}
      />
      <Image
        source={AppLogo}
        style={{ width: 200, height: 200, resizeMode: "cover" }}
      />
      <ThemedText style={styles.title}>{t("home.appName")}</ThemedText>
      <Spacer height={20} />
      <ThemedView style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: barWidth }]} />
      </ThemedView>
    </ThemedView>
  );
};

export default Loadingscreen;

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
  progressTrack: {
    width: 250,
    height: 12,
    backgroundColor: "#E0E0E0",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1976D2",
  },
});
