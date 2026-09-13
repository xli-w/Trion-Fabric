import type { ReactNode } from 'react';

import type { FabricDataset } from '@domain';
import { Card, EmptyState } from '@ui';

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
  const { dataset, error, isLoading } = useFabricData();

  if (isLoading) {
    return (
      <Card title={loadingTitle}>
        <p className="body-copy">{loadingDescription}</p>
      </Card>
    );
  }

  if (!dataset || error) {
    return <EmptyState description={error ?? 'No repository dataset is currently available.'} title={emptyTitle} />;
  }

  return <>{children(dataset)}</>;
}