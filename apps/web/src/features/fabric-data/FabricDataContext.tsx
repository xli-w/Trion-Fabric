import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import type { FabricDataset, FabricRepository, RepositorySource } from '@domain';

interface FabricDataContextValue {
  dataset: FabricDataset | null;
  error: string | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  repositorySource: RepositorySource;
}

const FabricDataContext = createContext<FabricDataContextValue | undefined>(undefined);

interface FabricDataProviderProps {
  children: ReactNode;
  repository: FabricRepository;
}

export function FabricDataProvider({ children, repository }: FabricDataProviderProps) {
  const [dataset, setDataset] = useState<FabricDataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDataset = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextDataset = await repository.getDataset();
      setDataset(nextDataset);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Unknown data loading error.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    void loadDataset();
  }, [loadDataset]);

  return (
    <FabricDataContext.Provider
      value={{
        dataset,
        error,
        isLoading,
        refresh: loadDataset,
        repositorySource: repository.source,
      }}
    >
      {children}
    </FabricDataContext.Provider>
  );
}

export function useFabricData() {
  const context = useContext(FabricDataContext);

  if (!context) {
    throw new Error('useFabricData must be used inside a FabricDataProvider.');
  }

  return context;
}