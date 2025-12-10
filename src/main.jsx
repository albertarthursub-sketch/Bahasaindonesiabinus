import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Cache buster - forces Vite to reload
console.log('App loading at:', new Date().toISOString());

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
