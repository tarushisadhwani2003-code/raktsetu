import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import AuthProvider from './context/AuthProvider';
import ToastProvider from './context/ToastProvider';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ToastProvider>
  </StrictMode>,
);
