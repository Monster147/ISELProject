import React from "react";
import { StyleSheet, Modal, useColorScheme } from "react-native";
import ThemedText from "@commons/components/ThemedText";
import { Colors } from "@commons/constants/Colors";
import ThemedView from "@components/ThemedView";
import ThemedButton from "@commons/components/ThemedButton";

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
};

/**
 * Modal de confirmação reutilizável (versão desktop/web).
 * Mostra um título, uma mensagem e os botões de confirmar e (opcionalmente) cancelar.
 *
 * @param visible Controla a visibilidade do modal.
 * @param title Título apresentado no topo do modal.
 * @param message Mensagem/corpo do modal.
 * @param confirmText Texto do botão de confirmação.
 * @param cancelText Texto do botão de cancelamento (se omitido, o botão não é mostrado).
 * @param onConfirm Callback invocado ao confirmar.
 * @param onCancel Callback invocado ao cancelar ou fechar o modal.
 * @param isLoading Se true, desativa os botões enquanto uma ação está em curso.
 */
const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <ThemedView style={styles.overlay}>
        <ThemedView style={styles.modalContainer}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.message}>{message}</ThemedText>

          <ThemedView style={styles.buttonContainer}>
            {cancelText && (
              <ThemedButton
                style={styles.cancelButton}
                onPress={onCancel}
                disabled={isLoading}
              >
                <ThemedText style={{ color: "#fff", textAlign: "center" }}>
                  {cancelText}
                </ThemedText>
              </ThemedButton>
            )}

            <ThemedButton
              style={styles.confirmButton}
              onPress={onConfirm}
              disabled={isLoading}
            >
              <ThemedText style={{ color: "#fff", textAlign: "center" }}>
                {confirmText}
              </ThemedText>
            </ThemedButton>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    borderRadius: 12,
    padding: 24,
    maxWidth: 400,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    backgroundColor: Colors.update,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    maxWidth: 140,
  },
  confirmButton: {
    backgroundColor: "#ff2d55",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    maxWidth: 140,
  },
});

export default ConfirmModal;
