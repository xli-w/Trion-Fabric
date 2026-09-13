import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { AppErrorBoundary } from '@app/app/AppErrorBoundary';
import { AppProviders } from '@app/app/AppProviders';
import { AppRouter } from '@app/app/router';
import '@ui/styles/index.css';
import '@app/styles/app.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <AppErrorBoundary>
    <StrictMode>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </StrictMode>
  </AppErrorBoundary>,
);
