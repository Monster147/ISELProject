import { useCallback } from "react";
import { BackHandler } from "react-native";
import { router, useFocusEffect } from "expo-router";

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
