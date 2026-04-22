// frontend/src/index.js: index.js 是 启动器/入口
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';  // ← 改成 globals.css
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();