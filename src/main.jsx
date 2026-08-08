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
import { DrawerProvider } from './context/DrawerContext.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 60_000 } },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ErrorBoundary>
            <SocketProvider>
              <NotificationProvider>
                <AuthModalProvider>
                  <DrawerProvider>
                    <App />
                  </DrawerProvider>
                </AuthModalProvider>
              </NotificationProvider>
            </SocketProvider>
          </ErrorBoundary>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);
