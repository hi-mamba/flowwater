import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initAppLifecycle } from './appLifecycle';

// Initialize Capacitor app lifecycle listeners before React render
initAppLifecycle();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
