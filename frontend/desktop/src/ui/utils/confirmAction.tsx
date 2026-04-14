import { useConfirm } from '../hooks/useConfirm';

export type ConfirmOptions = {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
};

export function useConfirmAction() {
    const { confirm } = useConfirm();

    return async (
        action: () => Promise<void> | void,
        options: ConfirmOptions
    ) => {
        const confirmed = await confirm(options);
        if (confirmed) {
            try {
                await action();
            } catch (error) {
                console.error('Error executing confirm action:', error);
            }
        }
    };
}
