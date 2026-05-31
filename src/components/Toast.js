import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, 3500);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div style={{
        position: 'fixed', bottom: '80px', right: '16px',
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px',
        maxWidth: '320px',
      }}>
        {toasts.map(toast => (
          <div key={toast.id} className={toast.exiting ? 'toast-exit' : 'toast-enter'} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 14px', borderRadius: '12px',
            background: toast.type === 'success' ? '#1A1A2E' : toast.type === 'error' ? '#C42D2D' : '#1B4B8A',
            color: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            fontSize: '14px', fontWeight: 500,
          }}>
            {toast.type === 'success' && <CheckCircle size={16} />}
            {toast.type === 'error' && <XCircle size={16} />}
            {toast.type === 'info' && <AlertCircle size={16} />}
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button onClick={() => dismiss(toast.id)} style={{ background: 'none', color: 'white', padding: 0 }}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
