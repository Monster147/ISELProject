import {Alert, AlertButton} from "react-native";

export type ConfirmOptions = {
    title: string;
    message: string;
    confirmText?: string;
    cancelText: string;
};

export function confirmAction(
    options: ConfirmOptions,
    action?: () => Promise<void> | void
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
            }
        });
    }

    Alert.alert(options.title, options.message, buttons);
}