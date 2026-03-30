'use client';

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextType {
    toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const toast = useCallback((type: ToastType, message: string) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        setToasts((prev) => [...prev, { id, type, message }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="toast-container">
                {toasts.map((t) => (
                    <ToastMessage key={t.id} item={t} onDismiss={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

/* ------------------------------------------------------------------ */
/*  Single toast                                                       */
/* ------------------------------------------------------------------ */

function ToastMessage({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onDismiss(item.id), 300);
        }, 4000);
        return () => clearTimeout(timer);
    }, [item.id, onDismiss]);

    const iconMap: Record<ToastType, string> = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
    };

    return (
        <div className={`toast toast--${item.type} ${isExiting ? 'toast--exit' : ''}`}>
            <span className="toast__icon">{iconMap[item.type]}</span>
            <span className="toast__message">{item.message}</span>
            <button
                className="toast__close"
                onClick={() => {
                    setIsExiting(true);
                    setTimeout(() => onDismiss(item.id), 300);
                }}
            >
                ✕
            </button>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useToast(): ToastContextType {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
}
