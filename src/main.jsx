import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import App from './App.jsx';
import { store } from './store/index.js';
import { SocketProvider } from './context/SocketContext.jsx';
import { NotificationProvider } from './context/NotificationProvider.jsx';
import { AuthModalProvider } from './context/AuthModalContext.jsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 60_000 } },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SocketProvider>
            <NotificationProvider>
              <AuthModalProvider>
                <App />
              </AuthModalProvider>
            </NotificationProvider>
          </SocketProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);
