import { useCallback } from "react";
import { BackHandler } from "react-native";
import { router, useFocusEffect } from "expo-router";

/**
 * Hook que interceta o botão físico de retrocesso no Android e executa uma ação personalizada.
 * Útil para redirecionar para um ecrã específico em vez de navegar para o anterior.
 * Usa `useFocusEffect` para registar e desregistar o handler ao entrar/sair do ecrã.
 *
 * @param action Função a executar quando o botão de retrocesso é pressionado.
 */
export function useBackRedirect(action: () => void) {
  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        action();
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction,
      );

      return () => backHandler.remove();
    }, [action]),
  );
}
