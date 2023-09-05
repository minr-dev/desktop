import './inversify.config';
import './wdyr';

import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/index.css';
import App from './App';
import { UserProvider } from './components/UserProvider';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
);
