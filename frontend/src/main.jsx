import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { apolloClient } from './api/apolloClient';
import { AuthProvider } from './context/AuthContext';
import { MobileProvider } from './context/MobileContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <MobileProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </MobileProvider>
      </AuthProvider>
    </ApolloProvider>
  </React.StrictMode>
);