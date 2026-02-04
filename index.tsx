import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  // If the app crashes during initial render, show a friendly error on screen
  console.error("Application Initialization Error:", error);
  rootElement.innerHTML = `
    <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #0f172a; color: white; padding: 20px; text-align: center; font-family: sans-serif;">
      <h1 style="color: #ef4444; font-size: 24px; margin-bottom: 10px;">Application Error</h1>
      <p style="color: #94a3b8;">Something went wrong while starting PropHunter AI.</p>
      <pre style="margin-top: 20px; background: #1e293b; padding: 10px; border-radius: 5px; overflow: auto; max-width: 100%; text-align: left; font-size: 12px;">${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
}