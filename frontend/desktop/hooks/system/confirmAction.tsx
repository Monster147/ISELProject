import { useConfirm } from "./useConfirm";

export type ConfirmOptions = {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
};

/**
 * Hook que combina o diálogo de confirmação com a execução de uma ação assíncrona
 * na versão desktop. Apresenta o diálogo ao utilizador e, se confirmado, executa a ação.
 *
 * @returns Função que recebe uma ação e opções de confirmação, e apresenta o diálogo.
 */
export function useConfirmAction() {
  const { confirm } = useConfirm();

  return async (
    action: () => Promise<void> | void,
    options: ConfirmOptions,
  ) => {
    const confirmed = await confirm(options);
    if (confirmed) {
      try {
        await action();
      } catch (error) {
        console.error("Error executing confirm action:", error);
      }
    }
  };
}
