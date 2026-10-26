import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ToastProvider } from './context/ToastContext';
import { MyListProvider } from './context/MyListContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import { TrailerProvider } from './context/TrailerContext';
import './index.css';

// getElementById can return null, so check before rendering.
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Missing <div id="root"> in index.html');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <MyListProvider>
          <RecentlyViewedProvider>
            <TrailerProvider>
              <App />
            </TrailerProvider>
          </RecentlyViewedProvider>
        </MyListProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
