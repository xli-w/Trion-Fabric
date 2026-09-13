import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import type { Client, Engagement, FabricDataset, FabricRepository, RepositorySource, Site } from '@domain';

interface FabricDataContextValue {
  dataset: FabricDataset | null;
  error: string | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  createClient: (input: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Client>;
  updateClient: (client: Client) => Promise<void>;
  createSite: (input: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Site>;
  updateSite: (site: Site) => Promise<void>;
  createEngagement: (input: Omit<Engagement, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Engagement>;
  updateEngagement: (engagement: Engagement) => Promise<void>;
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

  const persist = useCallback(async (nextDataset: FabricDataset) => {
    await repository.saveDataset(nextDataset);
    setDataset(nextDataset);
  }, [repository]);

  const now = () => new Date().toISOString();
  const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const createClient = useCallback(async (input: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!dataset) throw new Error('The repository dataset is not loaded.');
    const created = { ...input, id: createId('client'), createdAt: now(), updatedAt: now() };
    await persist({ ...dataset, clients: [...dataset.clients, created] });
    return created;
  }, [dataset, persist]);

  const updateClient = useCallback(async (client: Client) => {
    if (!dataset) throw new Error('The repository dataset is not loaded.');
    await persist({ ...dataset, clients: dataset.clients.map((item) => item.id === client.id ? { ...client, updatedAt: now() } : item) });
  }, [dataset, persist]);

  const createSite = useCallback(async (input: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!dataset || !dataset.clients.some((client) => client.id === input.clientId)) throw new Error('Select a valid client for this site.');
    const created = { ...input, id: createId('site'), createdAt: now(), updatedAt: now() };
    await persist({ ...dataset, sites: [...dataset.sites, created] });
    return created;
  }, [dataset, persist]);

  const updateSite = useCallback(async (site: Site) => {
    if (!dataset || !dataset.clients.some((client) => client.id === site.clientId)) throw new Error('Select a valid client for this site.');
    await persist({ ...dataset, sites: dataset.sites.map((item) => item.id === site.id ? { ...site, updatedAt: now() } : item) });
  }, [dataset, persist]);

  const createEngagement = useCallback(async (input: Omit<Engagement, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!dataset || !dataset.clients.some((client) => client.id === input.clientId) || input.siteIds.some((siteId) => !dataset.sites.some((site) => site.id === siteId))) {
      throw new Error('Select a valid client and site coverage for this engagement.');
    }
    const created = { ...input, id: createId('engagement'), createdAt: now(), updatedAt: now() };
    await persist({ ...dataset, engagements: [...dataset.engagements, created] });
    return created;
  }, [dataset, persist]);

  const updateEngagement = useCallback(async (engagement: Engagement) => {
    if (!dataset || !dataset.clients.some((client) => client.id === engagement.clientId) || engagement.siteIds.some((siteId) => !dataset.sites.some((site) => site.id === siteId))) {
      throw new Error('Select a valid client and site coverage for this engagement.');
    }
    await persist({ ...dataset, engagements: dataset.engagements.map((item) => item.id === engagement.id ? { ...engagement, updatedAt: now() } : item) });
  }, [dataset, persist]);

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
        createClient,
        updateClient,
        createSite,
        updateSite,
        createEngagement,
        updateEngagement,
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