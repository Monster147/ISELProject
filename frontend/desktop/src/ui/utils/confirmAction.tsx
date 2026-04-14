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
    const confirmed = window.confirm(`${options.title}\n\n${options.message}`);

    if (confirmed) {
        try {
            action();
        } catch (error) {}
    }
}