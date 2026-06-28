import { Alert, AlertButton } from "react-native";

export type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText: string;
};

/**
 * Apresenta um diálogo de confirmação nativo (Alert) e executa a ação se confirmado.
 * Suporta botão de cancelar obrigatório e botão de confirmação opcional.
 * Na plataforma móvel, o botão de confirmação usa estilo "destructive" para ações irreversíveis.
 *
 * @param options Configuração do diálogo (título, mensagem, textos dos botões).
 * @param action Ação assíncrona a executar se o utilizador confirmar. Opcional.
 */
export function confirmAction(
  options: ConfirmOptions,
  action?: () => Promise<void> | void,
) {
  const buttons: AlertButton[] = [];

  buttons.push({
    text: options.cancelText,
    style: "cancel",
  });

  if (options.confirmText && action) {
    buttons.push({
      text: options.confirmText,
      style: "destructive",
      onPress: async () => {
        try {
          await action();
        } catch (error) {
          console.error("Action error:", error);
        }
      },
    });
  }

  Alert.alert(options.title, options.message, buttons);
}
