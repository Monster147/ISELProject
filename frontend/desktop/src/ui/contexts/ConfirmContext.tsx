import React, { createContext, useState, useCallback, ReactNode } from 'react';

export type ConfirmOptions = {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
};

type ConfirmDialog = {
    options: ConfirmOptions;
    onConfirm: () => void;
    onCancel: () => void;
};

export type ConfirmContextType = {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
    isOpen: boolean;
    dialog: ConfirmDialog | null;
};

export const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider = ({ children }) => {
    const [dialog, setDialog] = useState<ConfirmDialog | null>(null);

    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setDialog({
                options,
                onConfirm: () => {
                    setDialog(null);
                    resolve(true);
                },
                onCancel: () => {
                    setDialog(null);
                    resolve(false);
                },
            });
        });
    }, []);

    const value: ConfirmContextType = {
        confirm,
        isOpen: dialog !== null,
        dialog,
    };

    return (
        <ConfirmContext.Provider value={value}>
            {children}
        </ConfirmContext.Provider>
    );
};


