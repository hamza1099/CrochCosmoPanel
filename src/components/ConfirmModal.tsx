import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Delete",
  cancelText = "Cancel"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
            <button 
              onClick={onCancel}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          
          <div>
            <h3 className="font-bold text-lg text-[#1b1c1a]">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel(); // Close modal after confirming
            }}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
