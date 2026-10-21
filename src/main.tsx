import React from 'react';
import ReactDOM from 'react-dom/client';
import * as THREE from 'three';
import App from './App';
import './index.css';

// Automatically prefix base path for GitHub Pages and subpath deployments
const baseUrl = import.meta.env.BASE_URL;
if (baseUrl && baseUrl !== '/') {
  THREE.DefaultLoadingManager.setURLModifier((url) => {
    if (
      url.startsWith('/textures/') ||
      url.startsWith('/sounds/') ||
      url.startsWith('/audio/') ||
      url.startsWith('/models/') ||
      url.startsWith('/fonts/') ||
      url.startsWith('/images/')
    ) {
      return `${baseUrl}${url.slice(1)}`;
    }
    return url;
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
