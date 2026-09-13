import type { ReactNode } from 'react';

import type { FabricDataset } from '@domain';
import { Button, Card, EmptyState } from '@ui';

import { useFabricData } from './FabricDataContext';

interface FabricDataViewProps {
  loadingTitle: string;
  loadingDescription: string;
  emptyTitle: string;
  children: (dataset: FabricDataset) => ReactNode;
}

export function FabricDataView({
  loadingTitle,
  loadingDescription,
  emptyTitle,
  children,
}: FabricDataViewProps) {
  const { dataset, error, isLoading, refresh } = useFabricData();

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

  return <>{children(dataset)}</>;
}
