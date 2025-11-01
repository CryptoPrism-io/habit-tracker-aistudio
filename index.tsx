import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App';

const GH_PAGES_REDIRECT_KEY = 'gh_pages_redirect';

try {
  const storedPath = sessionStorage.getItem(GH_PAGES_REDIRECT_KEY);
  if (storedPath) {
    const baseUrl = import.meta.env.BASE_URL;
    sessionStorage.removeItem(GH_PAGES_REDIRECT_KEY);

    if (baseUrl && storedPath.startsWith(baseUrl)) {
      window.history.replaceState(null, '', storedPath);
    }
  }
} catch (error) {
  console.warn('Failed to restore GitHub Pages redirect path:', error);
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

registerSW({
  immediate: false,
});
