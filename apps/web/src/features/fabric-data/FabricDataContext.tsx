import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
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
  BenefitMeasurement,
  DeliveryAction,
  Initiative,
  Milestone,
  Roadmap,
  Opportunity,
  Output,
  RepositorySource,
  Site,
  SiteWalk,
} from '@domain';

interface FabricDataContextValue {
  dataset: FabricDataset | null;
  error: string | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  createClient: (
    input: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<Client>;
  updateClient: (client: Client) => Promise<void>;
  createSite: (
    input: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<Site>;
  updateSite: (site: Site) => Promise<void>;
  createEngagement: (
    input: Omit<Engagement, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<Engagement>;
  updateEngagement: (engagement: Engagement) => Promise<void>;
  createSiteWalk: (
    input: Omit<SiteWalk, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<SiteWalk>;
  updateSiteWalk: (walk: SiteWalk) => Promise<void>;
  createObservation: (
    input: Omit<Observation, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<Observation>;
  updateObservation: (observation: Observation) => Promise<void>;
  createEvidence: (
    input: Omit<Evidence, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<Evidence>;
  createFrictionItem: (
    input: Omit<FrictionItem, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<FrictionItem>;
  updateFrictionItem: (item: FrictionItem) => Promise<void>;
  createDiagnostic: (
    input: Omit<Diagnostic, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<Diagnostic>;
  updateDiagnostic: (diagnostic: Diagnostic) => Promise<void>;
  saveMaturityAssessment: (assessment: MaturityAssessment) => Promise<void>;
  createOpportunity: (
    input: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<Opportunity>;
  updateOpportunity: (opportunity: Opportunity) => Promise<void>;
  createAction: (
    input: Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<ActionItem>;
  updateAction: (action: ActionItem) => Promise<void>;
  createInitiative: (
    input: Omit<Initiative, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<Initiative>;
  updateInitiative: (initiative: Initiative) => Promise<void>;
  createMilestone: (
    input: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<Milestone>;
  updateMilestone: (milestone: Milestone) => Promise<void>;
  createDeliveryAction: (
    input: Omit<DeliveryAction, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<DeliveryAction>;
  updateDeliveryAction: (action: DeliveryAction) => Promise<void>;
  createBenefitMeasurement: (
    input: Omit<BenefitMeasurement, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<BenefitMeasurement>;
  updateBenefitMeasurement: (measurement: BenefitMeasurement) => Promise<void>;
  createRoadmap: (
    input: Omit<Roadmap, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<Roadmap>;
  updateRoadmap: (roadmap: Roadmap) => Promise<void>;
  createOutput: (
    input: Omit<Output, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<Output>;
  updateOutput: (output: Output) => Promise<void>;
  repositorySource: RepositorySource;
}

const FabricDataContext = createContext<FabricDataContextValue | undefined>(
  undefined,
);

interface FabricDataProviderProps {
  children: ReactNode;
  repository: FabricRepository;
}

const outputStatusTransitions: Record<Output['status'], Output['status'][]> = {
  draft: ['draft', 'internal-review', 'archived'],
  'internal-review': ['draft', 'internal-review', 'approved', 'archived'],
  approved: ['internal-review', 'approved', 'published', 'archived'],
  published: ['published', 'archived'],
  archived: ['archived'],
};

function replaceExistingRecord<T extends { id: string; updatedAt: string }>(
  records: T[],
  record: T,
  timestamp: string,
  entityName: string,
) {
  if (!records.some((item) => item.id === record.id)) {
    throw new Error(`The ${entityName} no longer exists.`);
  }

  return records.map((item) =>
    item.id === record.id ? { ...record, updatedAt: timestamp } : item,
  );
}

function assertInitiativeContext(
  dataset: FabricDataset,
  initiative: Pick<
    Initiative,
    'engagementId' | 'opportunityId' | 'ownerUserId'
  >,
) {
  const opportunity = dataset.opportunities.find(
    (item) => item.id === initiative.opportunityId,
  );

  if (
    !dataset.engagements.some((item) => item.id === initiative.engagementId)
  ) {
    throw new Error('Select a valid engagement for this initiative.');
  }

  if (!opportunity || opportunity.engagementId !== initiative.engagementId) {
    throw new Error('Select an opportunity from the same engagement.');
  }

  if (
    (opportunity.status !== 'approved' &&
      opportunity.status !== 'in-delivery' &&
      opportunity.status !== 'closed') ||
    opportunity.approvalState !== 'approved' ||
    opportunity.reviewStatus !== 'approved' ||
    (opportunity.evidenceIds.length === 0 &&
      (opportunity.relatedObservationIds?.length ?? 0) === 0 &&
      (opportunity.relatedFindingIds?.length ?? 0) === 0) ||
    !opportunity.clientSummary
  ) {
    throw new Error(
      'An initiative requires an approved, evidence-linked opportunity with a client-safe summary.',
    );
  }

  if (!dataset.users.some((item) => item.id === initiative.ownerUserId)) {
    throw new Error('Select a valid owner for this initiative.');
  }
}

function assertRoadmapContext(
  dataset: FabricDataset,
  roadmap: Pick<
    Roadmap,
    'engagementId' | 'diagnosticId' | 'initiativeIds' | 'phases'
  >,
  existingRoadmapId?: string,
) {
  if (!dataset.engagements.some((item) => item.id === roadmap.engagementId)) {
    throw new Error('Select a valid engagement for this roadmap.');
  }

  if (
    roadmap.diagnosticId &&
    dataset.diagnostics.find((item) => item.id === roadmap.diagnosticId)
      ?.engagementId !== roadmap.engagementId
  ) {
    throw new Error('Select a diagnostic from the same engagement.');
  }

  if (
    roadmap.initiativeIds.some(
      (initiativeId) =>
        dataset.initiatives.find((item) => item.id === initiativeId)
          ?.engagementId !== roadmap.engagementId,
    )
  ) {
    throw new Error(
      'Roadmaps can only sequence initiatives from the same engagement.',
    );
  }

  if (
    roadmap.initiativeIds.some((initiativeId) => {
      const initiative = dataset.initiatives.find(
        (item) => item.id === initiativeId,
      );
      return initiative ? !roadmap.phases.includes(initiative.phase) : false;
    })
  ) {
    throw new Error('Include each selected initiative phase in the roadmap.');
  }

  if (
    roadmap.initiativeIds.some((initiativeId) =>
      dataset.roadmaps.some(
        (existingRoadmap) =>
          existingRoadmap.id !== existingRoadmapId &&
          existingRoadmap.initiativeIds.includes(initiativeId),
      ),
    )
  ) {
    throw new Error('An initiative can only appear in one active roadmap.');
  }
}

export function FabricDataProvider({
  children,
  repository,
}: FabricDataProviderProps) {
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
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Unknown data loading error.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  const persist = useCallback(
    async (nextDataset: FabricDataset) => {
      await repository.saveDataset(nextDataset);
      setDataset(nextDataset);
    },
    [repository],
  );

  const now = () => new Date().toISOString();
  const createId = (prefix: string) =>
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const createClient = useCallback(
    async (input: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!dataset) throw new Error('The repository dataset is not loaded.');
      const created = {
        ...input,
        id: createId('client'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({ ...dataset, clients: [...dataset.clients, created] });
      return created;
    },
    [dataset, persist],
  );

  const updateClient = useCallback(
    async (client: Client) => {
      if (!dataset) throw new Error('The repository dataset is not loaded.');
      await persist({
        ...dataset,
        clients: replaceExistingRecord(
          dataset.clients,
          client,
          now(),
          'client',
        ),
      });
    },
    [dataset, persist],
  );

  const createSite = useCallback(
    async (input: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (
        !dataset ||
        !dataset.clients.some((client) => client.id === input.clientId)
      )
        throw new Error('Select a valid client for this site.');
      const created = {
        ...input,
        id: createId('site'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({ ...dataset, sites: [...dataset.sites, created] });
      return created;
    },
    [dataset, persist],
  );

  const updateSite = useCallback(
    async (site: Site) => {
      if (
        !dataset ||
        !dataset.clients.some((client) => client.id === site.clientId)
      )
        throw new Error('Select a valid client for this site.');
      await persist({
        ...dataset,
        sites: replaceExistingRecord(dataset.sites, site, now(), 'site'),
      });
    },
    [dataset, persist],
  );

  const createEngagement = useCallback(
    async (input: Omit<Engagement, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (
        !dataset ||
        !dataset.clients.some((client) => client.id === input.clientId) ||
        input.siteIds.some(
          (siteId) =>
            dataset.sites.find((site) => site.id === siteId)?.clientId !==
            input.clientId,
        )
      ) {
        throw new Error(
          'Select a valid client and site coverage for this engagement.',
        );
      }
      const created = {
        ...input,
        id: createId('engagement'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({
        ...dataset,
        engagements: [...dataset.engagements, created],
      });
      return created;
    },
    [dataset, persist],
  );

  const updateEngagement = useCallback(
    async (engagement: Engagement) => {
      if (
        !dataset ||
        !dataset.clients.some((client) => client.id === engagement.clientId) ||
        engagement.siteIds.some(
          (siteId) =>
            dataset.sites.find((site) => site.id === siteId)?.clientId !==
            engagement.clientId,
        )
      ) {
        throw new Error(
          'Select a valid client and site coverage for this engagement.',
        );
      }
      await persist({
        ...dataset,
        engagements: replaceExistingRecord(
          dataset.engagements,
          engagement,
          now(),
          'engagement',
        ),
      });
    },
    [dataset, persist],
  );

  const createSiteWalk = useCallback(
    async (input: Omit<SiteWalk, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (
        !dataset ||
        !dataset.engagements
          .find((item) => item.id === input.engagementId)
          ?.siteIds.includes(input.siteId) ||
        !dataset.sites.some((item) => item.id === input.siteId)
      ) {
        throw new Error('Select a valid engagement and site for this walk.');
      }
      const created = {
        ...input,
        id: createId('walk'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({ ...dataset, siteWalks: [...dataset.siteWalks, created] });
      return created;
    },
    [dataset, persist],
  );

  const updateSiteWalk = useCallback(
    async (walk: SiteWalk) => {
      if (
        !dataset ||
        !dataset.engagements
          .find((item) => item.id === walk.engagementId)
          ?.siteIds.includes(walk.siteId) ||
        !dataset.sites.some((item) => item.id === walk.siteId)
      ) {
        throw new Error('Select a valid engagement and site for this walk.');
      }
      await persist({
        ...dataset,
        siteWalks: replaceExistingRecord(
          dataset.siteWalks,
          walk,
          now(),
          'site walk',
        ),
      });
    },
    [dataset, persist],
  );

  const createObservation = useCallback(
    async (input: Omit<Observation, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (
        !dataset ||
        !dataset.siteWalks.some((item) => item.id === input.siteWalkId)
      )
        throw new Error('Select a valid site walk for this observation.');
      const created = {
        ...input,
        id: createId('observation'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({
        ...dataset,
        observations: [...dataset.observations, created],
      });
      return created;
    },
    [dataset, persist],
  );

  const updateObservation = useCallback(
    async (observation: Observation) => {
      if (
        !dataset ||
        !dataset.siteWalks.some((item) => item.id === observation.siteWalkId)
      )
        throw new Error('Select a valid site walk for this observation.');
      await persist({
        ...dataset,
        observations: replaceExistingRecord(
          dataset.observations,
          observation,
          now(),
          'observation',
        ),
      });
    },
    [dataset, persist],
  );

  const createEvidence = useCallback(
    async (input: Omit<Evidence, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (
        !dataset ||
        (input.siteWalkId &&
          !dataset.siteWalks.some((item) => item.id === input.siteWalkId)) ||
        (input.observationId &&
          !dataset.observations.some((item) => item.id === input.observationId))
      ) {
        throw new Error(
          'Select a valid site walk or observation for this evidence.',
        );
      }
      const created = {
        ...input,
        id: createId('evidence'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({ ...dataset, evidence: [...dataset.evidence, created] });
      return created;
    },
    [dataset, persist],
  );

  const createFrictionItem = useCallback(
    async (input: Omit<FrictionItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (
        !dataset ||
        !dataset.siteWalks.some((item) => item.id === input.siteWalkId)
      )
        throw new Error('Select a valid site walk for this friction item.');
      const created = {
        ...input,
        id: createId('friction'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({
        ...dataset,
        frictionItems: [...dataset.frictionItems, created],
      });
      return created;
    },
    [dataset, persist],
  );

  const updateFrictionItem = useCallback(
    async (item: FrictionItem) => {
      if (
        !dataset ||
        !dataset.siteWalks.some((walk) => walk.id === item.siteWalkId)
      )
        throw new Error('Select a valid site walk for this friction item.');
      await persist({
        ...dataset,
        frictionItems: replaceExistingRecord(
          dataset.frictionItems,
          item,
          now(),
          'friction item',
        ),
      });
    },
    [dataset, persist],
  );

  const createDiagnostic = useCallback(
    async (input: Omit<Diagnostic, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (
        !dataset ||
        !dataset.engagements.some((item) => item.id === input.engagementId)
      )
        throw new Error('Select a valid engagement for this diagnostic.');
      const created = {
        ...input,
        id: createId('diagnostic'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({
        ...dataset,
        diagnostics: [...dataset.diagnostics, created],
      });
      return created;
    },
    [dataset, persist],
  );

  const updateDiagnostic = useCallback(
    async (diagnostic: Diagnostic) => {
      if (
        !dataset ||
        !dataset.engagements.some((item) => item.id === diagnostic.engagementId)
      )
        throw new Error('Select a valid engagement for this diagnostic.');
      await persist({
        ...dataset,
        diagnostics: replaceExistingRecord(
          dataset.diagnostics,
          diagnostic,
          now(),
          'diagnostic',
        ),
      });
    },
    [dataset, persist],
  );

  const saveMaturityAssessment = useCallback(
    async (assessment: MaturityAssessment) => {
      if (
        !dataset ||
        !dataset.diagnostics.some(
          (item) => item.id === assessment.diagnosticId,
        ) ||
        !dataset.diagnosticDimensions.some(
          (item) => item.id === assessment.dimensionId,
        )
      ) {
        throw new Error('Select a valid diagnostic and scorecard dimension.');
      }
      const exists = dataset.maturityAssessments.some(
        (item) => item.id === assessment.id,
      );
      const next = { ...assessment, updatedAt: now() };
      await persist({
        ...dataset,
        maturityAssessments: exists
          ? dataset.maturityAssessments.map((item) =>
              item.id === assessment.id ? next : item,
            )
          : [...dataset.maturityAssessments, next],
      });
    },
    [dataset, persist],
  );

  const createOpportunity = useCallback(
    async (input: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (
        !dataset ||
        !dataset.engagements.some((item) => item.id === input.engagementId)
      )
        throw new Error('Select a valid engagement for this opportunity.');
      const created = {
        ...input,
        id: createId('opportunity'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({
        ...dataset,
        opportunities: [...dataset.opportunities, created],
      });
      return created;
    },
    [dataset, persist],
  );

  const updateOpportunity = useCallback(
    async (opportunity: Opportunity) => {
      if (
        !dataset ||
        !dataset.engagements.some(
          (item) => item.id === opportunity.engagementId,
        )
      )
        throw new Error('Select a valid engagement for this opportunity.');
      await persist({
        ...dataset,
        opportunities: replaceExistingRecord(
          dataset.opportunities,
          opportunity,
          now(),
          'opportunity',
        ),
      });
    },
    [dataset, persist],
  );

  const createAction = useCallback(
    async (input: Omit<ActionItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (
        !dataset ||
        (input.opportunityId &&
          !dataset.opportunities.some(
            (item) => item.id === input.opportunityId,
          )) ||
        (input.initiativeId &&
          !dataset.initiatives.some((item) => item.id === input.initiativeId))
      )
        throw new Error(
          'Select a valid opportunity or initiative for this action.',
        );

      if (
        input.opportunityId &&
        input.initiativeId &&
        dataset.opportunities.find((item) => item.id === input.opportunityId)
          ?.engagementId !==
          dataset.initiatives.find((item) => item.id === input.initiativeId)
            ?.engagementId
      )
        throw new Error(
          'An action cannot combine records from different engagements.',
        );

      const created = {
        ...input,
        id: createId('action'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({
        ...dataset,
        actionItems: [...dataset.actionItems, created],
      });
      return created;
    },
    [dataset, persist],
  );

  const updateAction = useCallback(
    async (action: ActionItem) => {
      if (
        !dataset ||
        (action.opportunityId &&
          !dataset.opportunities.some(
            (item) => item.id === action.opportunityId,
          )) ||
        (action.initiativeId &&
          !dataset.initiatives.some((item) => item.id === action.initiativeId))
      )
        throw new Error(
          'Select a valid opportunity or initiative for this action.',
        );

      if (
        action.opportunityId &&
        action.initiativeId &&
        dataset.opportunities.find((item) => item.id === action.opportunityId)
          ?.engagementId !==
          dataset.initiatives.find((item) => item.id === action.initiativeId)
            ?.engagementId
      )
        throw new Error(
          'An action cannot combine records from different engagements.',
        );

      await persist({
        ...dataset,
        actionItems: replaceExistingRecord(
          dataset.actionItems,
          action,
          now(),
          'action',
        ),
      });
    },
    [dataset, persist],
  );

  const createInitiative = useCallback(
    async (input: Omit<Initiative, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!dataset) throw new Error('The repository dataset is not loaded.');
      assertInitiativeContext(dataset, input);
      const created = {
        ...input,
        id: createId('initiative'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({
        ...dataset,
        initiatives: [...dataset.initiatives, created],
      });
      return created;
    },
    [dataset, persist],
  );

  const updateInitiative = useCallback(
    async (initiative: Initiative) => {
      if (!dataset) throw new Error('The repository dataset is not loaded.');
      assertInitiativeContext(dataset, initiative);
      await persist({
        ...dataset,
        initiatives: replaceExistingRecord(
          dataset.initiatives,
          initiative,
          now(),
          'initiative',
        ),
      });
    },
    [dataset, persist],
  );

  const createMilestone = useCallback(
    async (input: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (
        !dataset ||
        !dataset.initiatives.some((item) => item.id === input.initiativeId)
      )
        throw new Error('Select a valid initiative for this milestone.');
      const created = {
        ...input,
        id: createId('milestone'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({
        ...dataset,
        milestones: [...dataset.milestones, created],
      });
      return created;
    },
    [dataset, persist],
  );

  const updateMilestone = useCallback(
    async (milestone: Milestone) => {
      if (
        !dataset ||
        !dataset.initiatives.some((item) => item.id === milestone.initiativeId)
      )
        throw new Error('Select a valid initiative for this milestone.');
      await persist({
        ...dataset,
        milestones: replaceExistingRecord(
          dataset.milestones,
          milestone,
          now(),
          'milestone',
        ),
      });
    },
    [dataset, persist],
  );

  const createDeliveryAction = useCallback(
    async (input: Omit<DeliveryAction, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (
        !dataset ||
        !dataset.initiatives.some((item) => item.id === input.initiativeId)
      )
        throw new Error('Select a valid initiative for this delivery action.');
      const created = {
        ...input,
        id: createId('delivery-action'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({
        ...dataset,
        deliveryActions: [...dataset.deliveryActions, created],
      });
      return created;
    },
    [dataset, persist],
  );

  const updateDeliveryAction = useCallback(
    async (action: DeliveryAction) => {
      if (
        !dataset ||
        !dataset.initiatives.some((item) => item.id === action.initiativeId)
      )
        throw new Error('Select a valid initiative for this delivery action.');
      await persist({
        ...dataset,
        deliveryActions: replaceExistingRecord(
          dataset.deliveryActions,
          action,
          now(),
          'delivery action',
        ),
      });
    },
    [dataset, persist],
  );

  const createBenefitMeasurement = useCallback(
    async (
      input: Omit<BenefitMeasurement, 'id' | 'createdAt' | 'updatedAt'>,
    ) => {
      if (
        !dataset ||
        !dataset.initiatives.some((item) => item.id === input.initiativeId)
      )
        throw new Error('Select a valid initiative for this benefit measure.');
      const created = {
        ...input,
        id: createId('benefit'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({
        ...dataset,
        benefitMeasurements: [...dataset.benefitMeasurements, created],
      });
      return created;
    },
    [dataset, persist],
  );

  const updateBenefitMeasurement = useCallback(
    async (measurement: BenefitMeasurement) => {
      if (
        !dataset ||
        !dataset.initiatives.some(
          (item) => item.id === measurement.initiativeId,
        )
      )
        throw new Error('Select a valid initiative for this benefit measure.');
      await persist({
        ...dataset,
        benefitMeasurements: replaceExistingRecord(
          dataset.benefitMeasurements,
          measurement,
          now(),
          'benefit measurement',
        ),
      });
    },
    [dataset, persist],
  );

  const createRoadmap = useCallback(
    async (input: Omit<Roadmap, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!dataset) throw new Error('The repository dataset is not loaded.');
      assertRoadmapContext(dataset, input);
      const created = {
        ...input,
        id: createId('roadmap'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({ ...dataset, roadmaps: [...dataset.roadmaps, created] });
      return created;
    },
    [dataset, persist],
  );

  const updateRoadmap = useCallback(
    async (roadmap: Roadmap) => {
      if (!dataset) throw new Error('The repository dataset is not loaded.');
      assertRoadmapContext(dataset, roadmap, roadmap.id);
      await persist({
        ...dataset,
        roadmaps: replaceExistingRecord(
          dataset.roadmaps,
          roadmap,
          now(),
          'roadmap',
        ),
      });
    },
    [dataset, persist],
  );

  const createOutput = useCallback(
    async (input: Omit<Output, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (
        !dataset ||
        !dataset.engagements.some((item) => item.id === input.engagementId)
      )
        throw new Error('Select a valid engagement for this output.');
      if (input.status !== 'draft' || input.visibility !== 'internal') {
        throw new Error(
          'New controlled outputs must start as internal drafts.',
        );
      }
      const created = {
        ...input,
        id: createId('output'),
        createdAt: now(),
        updatedAt: now(),
      };
      await persist({ ...dataset, outputs: [...dataset.outputs, created] });
      return created;
    },
    [dataset, persist],
  );

  const updateOutput = useCallback(
    async (output: Output) => {
      if (
        !dataset ||
        !dataset.engagements.some((item) => item.id === output.engagementId)
      )
        throw new Error('Select a valid engagement for this output.');
      const existing = dataset.outputs.find((item) => item.id === output.id);
      if (!existing) throw new Error('The output no longer exists.');
      if (!outputStatusTransitions[existing.status].includes(output.status)) {
        throw new Error(
          `Cannot move an output from ${existing.status} to ${output.status}.`,
        );
      }
      await persist({
        ...dataset,
        outputs: replaceExistingRecord(
          dataset.outputs,
          output,
          now(),
          'output',
        ),
      });
    },
    [dataset, persist],
  );

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
        createInitiative,
        updateInitiative,
        createMilestone,
        updateMilestone,
        createDeliveryAction,
        updateDeliveryAction,
        createBenefitMeasurement,
        updateBenefitMeasurement,
        createRoadmap,
        updateRoadmap,
        createOutput,
        updateOutput,
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
