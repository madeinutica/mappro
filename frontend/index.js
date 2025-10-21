import React from 'react';
import { createRoot } from 'react-dom/client';

import './styles.css';
import App from './App';

console.log('React app starting...');

const container = document.getElementById('root');
console.log('Root container:', container);

if (!container) {
  console.error('Root container not found!');
} else {
  const root = createRoot(container);
  console.log('Creating React root...');
  root.render(<App />);
  console.log('React app rendered');
}
