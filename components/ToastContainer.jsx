'use client';

import React from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function ToastContainer() {
  const { toasts, dismissToast } = useStore();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-[76px] inset-x-3 sm:top-auto sm:left-auto sm:bottom-5 sm:right-5 z-[110] flex flex-col gap-2 sm:max-w-sm sm:w-full pointer-events-none no-print">
      {toasts.map((toast) => {
        const Icon = toast.type === 'error' ? AlertCircle : toast.type === 'info' ? Info : Check;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 sm:py-3.5 shadow-xl border animate-fade-up ${
              toast.type === 'error'
                ? 'bg-red-950 text-white border-red-800'
                : 'bg-[#0B0B0C] text-white border-black'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <p className="text-xs flex-1 leading-relaxed">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="p-1 text-white/60 hover:text-white shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
