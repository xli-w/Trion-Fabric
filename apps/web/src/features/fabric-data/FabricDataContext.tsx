import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import type {
  Client,
  Diagnostic,
  Engagement,
  Evidence,
  FabricDataset,
  FabricRepository,
  FrictionItem,
  Observation,
  MaturityAssessment,
  ActionItem,
  Opportunity,
  RepositorySource,
  Site,
  SiteWalk,
} from '@domain';

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
  createSiteWalk: (input: Omit<SiteWalk, 'id' | 'createdAt' | 'updatedAt'>) => Promise<SiteWalk>;
  updateSiteWalk: (walk: SiteWalk) => Promise<void>;
  createObservation: (input: Omit<Observation, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Observation>;
  updateObservation: (observation: Observation) => Promise<void>;
  createEvidence: (input: Omit<Evidence, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Evidence>;
  createFrictionItem: (input: Omit<FrictionItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<FrictionItem>;
  updateFrictionItem: (item: FrictionItem) => Promise<void>;
  createDiagnostic: (input: Omit<Diagnostic, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Diagnostic>;
  updateDiagnostic: (diagnostic: Diagnostic) => Promise<void>;
  saveMaturityAssessment: (assessment: MaturityAssessment) => Promise<void>;
  createOpportunity: (input: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Opportunity>;
  updateOpportunity: (opportunity: Opportunity) => Promise<void>;
  createAction: (input: Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ActionItem>;
  updateAction: (action: ActionItem) => Promise<void>;
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

  const createSiteWalk = useCallback(async (input: Omit<SiteWalk, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!dataset || !dataset.engagements.some((item) => item.id === input.engagementId) || !dataset.sites.some((item) => item.id === input.siteId)) {
      throw new Error('Select a valid engagement and site for this walk.');
    }
    const created = { ...input, id: createId('walk'), createdAt: now(), updatedAt: now() };
    await persist({ ...dataset, siteWalks: [...dataset.siteWalks, created] });
    return created;
  }, [dataset, persist]);

  const updateSiteWalk = useCallback(async (walk: SiteWalk) => {
    if (!dataset || !dataset.engagements.some((item) => item.id === walk.engagementId) || !dataset.sites.some((item) => item.id === walk.siteId)) {
      throw new Error('Select a valid engagement and site for this walk.');
    }
    await persist({ ...dataset, siteWalks: dataset.siteWalks.map((item) => item.id === walk.id ? { ...walk, updatedAt: now() } : item) });
  }, [dataset, persist]);

  const createObservation = useCallback(async (input: Omit<Observation, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!dataset || !dataset.siteWalks.some((item) => item.id === input.siteWalkId)) throw new Error('Select a valid site walk for this observation.');
    const created = { ...input, id: createId('observation'), createdAt: now(), updatedAt: now() };
    await persist({ ...dataset, observations: [...dataset.observations, created] });
    return created;
  }, [dataset, persist]);

  const updateObservation = useCallback(async (observation: Observation) => {
    if (!dataset || !dataset.siteWalks.some((item) => item.id === observation.siteWalkId)) throw new Error('Select a valid site walk for this observation.');
    await persist({ ...dataset, observations: dataset.observations.map((item) => item.id === observation.id ? { ...observation, updatedAt: now() } : item) });
  }, [dataset, persist]);

  const createEvidence = useCallback(async (input: Omit<Evidence, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!dataset || (input.siteWalkId && !dataset.siteWalks.some((item) => item.id === input.siteWalkId)) || (input.observationId && !dataset.observations.some((item) => item.id === input.observationId))) {
      throw new Error('Select a valid site walk or observation for this evidence.');
    }
    const created = { ...input, id: createId('evidence'), createdAt: now(), updatedAt: now() };
    await persist({ ...dataset, evidence: [...dataset.evidence, created] });
    return created;
  }, [dataset, persist]);

  const createFrictionItem = useCallback(async (input: Omit<FrictionItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!dataset || !dataset.siteWalks.some((item) => item.id === input.siteWalkId)) throw new Error('Select a valid site walk for this friction item.');
    const created = { ...input, id: createId('friction'), createdAt: now(), updatedAt: now() };
    await persist({ ...dataset, frictionItems: [...dataset.frictionItems, created] });
    return created;
  }, [dataset, persist]);

  const updateFrictionItem = useCallback(async (item: FrictionItem) => {
    if (!dataset || !dataset.siteWalks.some((walk) => walk.id === item.siteWalkId)) throw new Error('Select a valid site walk for this friction item.');
    await persist({ ...dataset, frictionItems: dataset.frictionItems.map((existing) => existing.id === item.id ? { ...item, updatedAt: now() } : existing) });
  }, [dataset, persist]);

  const createDiagnostic = useCallback(async (input: Omit<Diagnostic, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!dataset || !dataset.engagements.some((item) => item.id === input.engagementId)) throw new Error('Select a valid engagement for this diagnostic.');
    const created = { ...input, id: createId('diagnostic'), createdAt: now(), updatedAt: now() };
    await persist({ ...dataset, diagnostics: [...dataset.diagnostics, created] });
    return created;
  }, [dataset, persist]);

  const updateDiagnostic = useCallback(async (diagnostic: Diagnostic) => {
    if (!dataset || !dataset.engagements.some((item) => item.id === diagnostic.engagementId)) throw new Error('Select a valid engagement for this diagnostic.');
    await persist({ ...dataset, diagnostics: dataset.diagnostics.map((item) => item.id === diagnostic.id ? { ...diagnostic, updatedAt: now() } : item) });
  }, [dataset, persist]);

  const saveMaturityAssessment = useCallback(async (assessment: MaturityAssessment) => {
    if (!dataset || !dataset.diagnostics.some((item) => item.id === assessment.diagnosticId) || !dataset.diagnosticDimensions.some((item) => item.id === assessment.dimensionId)) {
      throw new Error('Select a valid diagnostic and scorecard dimension.');
    }
    const exists = dataset.maturityAssessments.some((item) => item.id === assessment.id);
    const next = { ...assessment, updatedAt: now() };
    await persist({ ...dataset, maturityAssessments: exists ? dataset.maturityAssessments.map((item) => item.id === assessment.id ? next : item) : [...dataset.maturityAssessments, next] });
  }, [dataset, persist]);

  const createOpportunity = useCallback(async (input: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!dataset || !dataset.engagements.some((item) => item.id === input.engagementId)) throw new Error('Select a valid engagement for this opportunity.');
    const created = { ...input, id: createId('opportunity'), createdAt: now(), updatedAt: now() };
    await persist({ ...dataset, opportunities: [...dataset.opportunities, created] });
    return created;
  }, [dataset, persist]);

  const updateOpportunity = useCallback(async (opportunity: Opportunity) => {
    if (!dataset || !dataset.engagements.some((item) => item.id === opportunity.engagementId)) throw new Error('Select a valid engagement for this opportunity.');
    await persist({ ...dataset, opportunities: dataset.opportunities.map((item) => item.id === opportunity.id ? { ...opportunity, updatedAt: now() } : item) });
  }, [dataset, persist]);

  const createAction = useCallback(async (input: Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!dataset || (input.opportunityId && !dataset.opportunities.some((item) => item.id === input.opportunityId))) throw new Error('Select a valid opportunity for this action.');
    const created = { ...input, id: createId('action'), createdAt: now(), updatedAt: now() };
    await persist({ ...dataset, actionItems: [...dataset.actionItems, created] });
    return created;
  }, [dataset, persist]);

  const updateAction = useCallback(async (action: ActionItem) => {
    if (!dataset || (action.opportunityId && !dataset.opportunities.some((item) => item.id === action.opportunityId))) throw new Error('Select a valid opportunity for this action.');
    await persist({ ...dataset, actionItems: dataset.actionItems.map((item) => item.id === action.id ? { ...action, updatedAt: now() } : item) });
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
        createSiteWalk,
        updateSiteWalk,
        createObservation,
        updateObservation,
        createEvidence,
        createFrictionItem,
        updateFrictionItem,
        createDiagnostic,
        updateDiagnostic,
        saveMaturityAssessment,
        createOpportunity,
        updateOpportunity,
        createAction,
        updateAction,
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