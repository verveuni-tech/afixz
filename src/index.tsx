import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import "@fontsource-variable/inter";
import "@fontsource/raleway/latin-500.css";
import "@fontsource/raleway/latin-600.css";
import "@fontsource/raleway/latin-700.css";
import "@fontsource/roboto-condensed/latin-400.css";
import "@fontsource/roboto-condensed/latin-500.css";
import "@fontsource/roboto-condensed/latin-600.css";
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LocationProvider } from './context/LocationContext';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <CartProvider>
            <App />
            <Analytics />
            <SpeedInsights />
          </CartProvider>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);