import React from 'react';
import './index.css';
import { createRoot } from 'react-dom/client';
import { AppRouter } from './AppRouter';

// Handle client-side routing for GitHub Pages
const handleRoute = () => {
  const path = window.location.hash.slice(2); // Remove '#!'
  if (path) {
    window.history.replaceState(null, '', path);
  }
};

// Listen for hash changes (GitHub Pages routing)
window.addEventListener('hashchange', handleRoute);

// Handle initial route
if (window.location.hash.startsWith('#!')) {
  handleRoute();
}

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<AppRouter />);
}