import { Alert } from "react-native";

export type ConfirmOptions = {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
};

export function confirmAction(
    action: () => Promise<void> | void,
    options: ConfirmOptions
) {
    Alert.alert(
        options.title,
        options.message,
        [
            {
                text: options.cancelText,
                style: "cancel",
            },
            {
                text: options.confirmText,
                style: "destructive",
                onPress: async () => {
                    try {
                        await action();
                    } catch (error) {
                    }
                }
            },
        ]
    );
}