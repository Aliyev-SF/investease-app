// src/components/ToastContainer.jsx
import { useState, useEffect, createContext, useContext } from 'react';

// Create context for toast
const ToastContext = createContext();

// Hook to use toast from any component
// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// Toast Provider Component
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    const newToast = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// Toast Container Component (renders all toasts)
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

// Individual Toast Component
function Toast({ message, type, onClose }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exit animation before removal
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, 2700); // Start exit 300ms before auto-dismiss

    return () => clearTimeout(timer);
  }, []);

  const typeStyles = {
    success: 'bg-gradient-to-r from-success to-green-600',
    error: 'bg-gradient-to-r from-danger to-red-600',
    info: 'bg-gradient-to-r from-primary to-primary-dark',
    warning: 'bg-gradient-to-r from-warning to-orange-600'
  };

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };

  return (
    <div
      className={`
        ${typeStyles[type]}
        text-white rounded-2xl p-4 shadow-2xl
        min-w-[300px] max-w-[400px]
        transform transition-all duration-300
        ${isExiting ? 'translate-x-[450px] opacity-0' : 'translate-x-0 opacity-100'}
      `}
      style={{
        animation: isExiting ? 'none' : 'slideInRight 0.3s ease-out'
      }}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">{icons[type]}</div>
        <div className="flex-1">
          <div className="font-semibold text-white leading-relaxed">
            {message}
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all"
          aria-label="Close notification"
        >
          <span className="text-white text-sm">×</span>
        </button>
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(450px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default ToastProvider;