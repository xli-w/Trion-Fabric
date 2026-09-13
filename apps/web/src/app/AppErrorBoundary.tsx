import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

import { Button, EmptyState } from '@ui';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  public state: AppErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError() {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('Fabric application render error.', error, errorInfo);
    }
  }

  private retry = () => {
    this.setState({ hasError: false });
  };

  private reload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <main className="app-error-boundary">
          <EmptyState
            action={
              <div className="app-error-boundary__actions">
                <Button onClick={this.retry}>Try again</Button>
                <Button onClick={this.reload} variant="secondary">
                  Reload Fabric
                </Button>
              </div>
            }
            description="Fabric could not display this workspace safely. No change was saved. Try again or reload the application."
            title="The workspace could not be loaded"
          />
        </main>
      );
    }

    return this.props.children;
  }
}
