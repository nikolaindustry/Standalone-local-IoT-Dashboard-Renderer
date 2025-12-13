// Standalone toast hook - simplified version for standalone mode
import { useState, useCallback } from 'react';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  action?: React.ReactNode;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, variant = 'default', action }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { id, title, description, variant, action };
    setToasts((prev) => [...prev, newToast]);

    // Log to console in standalone mode
    console.log(`[Toast ${variant}]`, title, description);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);

    return { id };
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    toast,
    toasts,
    dismiss,
  };
}

// Export toast function directly for compatibility
export { useToast as toast };
