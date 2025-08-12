import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, XCircle, X } from 'lucide-react';

// Toast notification component
function Toast({ toast, onDismiss, darkMode }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle size={20} />;
      case 'error': return <XCircle size={20} />;
      case 'warning': return <AlertTriangle size={20} />;
      case 'info': return <AlertCircle size={20} />;
      default: return <AlertCircle size={20} />;
    }
  };

  const getColorClasses = () => {
    const base = darkMode ? 'text-white' : 'text-gray-900';
    switch (toast.type) {
      case 'success': 
        return {
          bg: darkMode ? 'bg-green-800 border-green-700' : 'bg-green-100 border-green-400',
          icon: 'text-green-500',
          text: base
        };
      case 'error':
        return {
          bg: darkMode ? 'bg-red-800 border-red-700' : 'bg-red-100 border-red-400',
          icon: 'text-red-500',
          text: base
        };
      case 'warning':
        return {
          bg: darkMode ? 'bg-yellow-800 border-yellow-700' : 'bg-yellow-100 border-yellow-400',
          icon: 'text-yellow-500',
          text: base
        };
      case 'info':
        return {
          bg: darkMode ? 'bg-blue-800 border-blue-700' : 'bg-blue-100 border-blue-400',
          icon: 'text-blue-500',
          text: base
        };
      default:
        return {
          bg: darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-400',
          icon: 'text-gray-500',
          text: base
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border-l-4 ${colors.bg} shadow-lg transition-all duration-300 animate-slide-in`}>
      <div className={colors.icon}>
        {getIcon()}
      </div>
      <div className="flex-1">
        {toast.title && (
          <p className={`font-semibold text-sm ${colors.text}`}>
            {toast.title}
          </p>
        )}
        <p className={`text-sm ${colors.text} ${toast.title ? 'mt-1' : ''}`}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className={`${colors.text} hover:opacity-70 transition-opacity`}
      >
        <X size={16} />
      </button>
    </div>
  );
}

// Toast container component
function ToastContainer({ toasts, onDismissToast, darkMode }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onDismiss={onDismissToast}
          darkMode={darkMode}
        />
      ))}
    </div>
  );
}

export { Toast, ToastContainer };