import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'
import "@fontsource-variable/inter";
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { ToastProvider } from './src/components/ui/Toast';


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <ToastProvider>
    <AuthProvider>
      <CartProvider>
      <App />
      </CartProvider>
      </AuthProvider>
    </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);