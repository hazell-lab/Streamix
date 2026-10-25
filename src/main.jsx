import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { MyListProvider } from './context/MyListContext.jsx';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext.jsx';
import { TrailerProvider } from './context/TrailerContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
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
