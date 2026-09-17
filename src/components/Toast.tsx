'use client';

import React from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'error' | 'success' | 'info';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full px-2 sm:px-0">
      {toasts.map((toast) => {
        let borderBg = 'border-[#2A3346] bg-[#161D2C]';
        let icon = <Info className="w-4 h-4 text-[#C9A15D]" />;

        if (toast.type === 'error') {
          borderBg = 'border-[#B4694A]/60 bg-[#161D2C]';
          icon = <AlertTriangle className="w-4 h-4 text-[#B4694A]" />;
        } else if (toast.type === 'success') {
          borderBg = 'border-[#4A7C64]/60 bg-[#161D2C]';
          icon = <CheckCircle className="w-4 h-4 text-[#4A7C64]" />;
        }

        return (
          <div
            key={toast.id}
            className={`p-3 rounded border ${borderBg} text-[#E8EAF0] shadow-xl flex items-start justify-between space-x-3 transition-all animate-in fade-in slide-in-from-bottom-2`}
          >
            <div className="flex items-start space-x-2.5">
              <div className="mt-0.5">{icon}</div>
              <div>
                <h5 className="text-xs font-semibold text-[#E8EAF0]">{toast.title}</h5>
                <p className="text-[11px] text-[#8B92A8] mt-0.5 leading-relaxed">
                  {toast.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#8B92A8] hover:text-[#E8EAF0] p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
