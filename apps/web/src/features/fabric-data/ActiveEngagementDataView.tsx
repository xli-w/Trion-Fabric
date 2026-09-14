import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import type { FabricDataset } from '@domain';
import { Button, Card, EmptyState } from '@ui';

import { useFabricData } from './FabricDataContext';

interface ActiveEngagementDataViewProps {
  loadingTitle: string;
  loadingDescription: string;
  emptyTitle: string;
  children: (dataset: FabricDataset) => ReactNode;
}

export function ActiveEngagementDataView({
  loadingTitle,
  loadingDescription,
  emptyTitle,
  children,
}: ActiveEngagementDataViewProps) {
  const {
    dataset,
    activeDataset,
    activeEngagement,
    error,
    isLoading,
    refresh,
  } = useFabricData();

  if (isLoading) {
    return (
      <Card title={loadingTitle}>
        <p className="body-copy">{loadingDescription}</p>
      </Card>
    );
  }

  if (!dataset || error) {
    return (
      <EmptyState
        action={
          <Button onClick={() => void refresh()} variant="secondary">
            Retry loading data
          </Button>
        }
        description={error ?? 'No repository dataset is currently available.'}
        title={emptyTitle}
      />
    );
  }

  if (!activeDataset || !activeEngagement) {
    return (
      <EmptyState
        action={
          <Link className="table-link" to="/clients">
            Open client library
          </Link>
        }
        description="Choose an engagement from the workspace context selector or open one from its client record."
        title="Select an active engagement"
      />
    );
  }

  return <>{children(activeDataset)}</>;
}
