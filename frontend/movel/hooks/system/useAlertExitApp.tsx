import { useCallback } from "react";
import { Alert, BackHandler } from "react-native";
import { useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";

/**
 * Hook que interceta o botão físico de retrocesso no Android e apresenta
 * um diálogo de confirmação antes de sair da aplicação.
 * Usa useFocusEffect para registar e desregistar o handler ao entrar/sair do ecrã.
 *
 * @see https://reactnative.dev/docs/backhandler
 */
export function useAlertExitApp() {
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        Alert.alert(t("exitApp.title"), t("exitApp.message"), [
          {
            text: t("exitApp.cancel"),
            onPress: () => null,
            style: "cancel",
          },
          {
            text: t("exitApp.confirm"),
            onPress: () => BackHandler.exitApp(),
          },
        ]);

        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction,
      );

      return () => backHandler.remove();
    }, []),
  );
}
