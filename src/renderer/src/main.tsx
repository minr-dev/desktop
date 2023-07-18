import {} from './inversify.config';
import './wdyr';

import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/index.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
