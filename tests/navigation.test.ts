import { describe, expect, it } from 'vitest';

import { fabricNavigation, findNavigationItem } from '@config';

describe('workspace navigation', () => {
  it('exposes the five workspace-centred product areas', () => {
    expect(fabricNavigation.map((item) => item.label)).toEqual([
      'Workspace',
      'Understand',
      'Analyse',
      'Plan & Output',
      'Clients',
    ]);
  });

  it.each([
    ['/workspace', 'workspace'],
    ['/workspace/engagement-northbank-diagnostic', 'workspace'],
    ['/engagements', 'clients'],
    ['/engagements/engagement-northbank-diagnostic', 'workspace'],
    ['/clients', 'clients'],
    ['/clients/client-northbank-precision', 'clients'],
    ['/sites', 'clients'],
    ['/sites/site-northbank-main', 'clients'],
    ['/understand', 'understand'],
    ['/site-walks', 'understand'],
    ['/site-walks/walk-northbank-machine-shop-01', 'understand'],
    ['/landscape', 'understand'],
    ['/evidence', 'understand'],
    ['/analyse', 'analyse'],
    ['/diagnosis', 'analyse'],
    ['/opportunities', 'analyse'],
    ['/opportunities/opp-handover-standardisation', 'analyse'],
    ['/plan-output', 'plan-output'],
    ['/roadmap', 'plan-output'],
    ['/roadmap/initiative-handover-foundation', 'plan-output'],
    ['/benefits', 'plan-output'],
    ['/outputs', 'plan-output'],
    ['/outputs/output-northbank-transformation-roadmap', 'plan-output'],
    ['/knowledge', 'workspace'],
  ])('maps %s to the %s workstream', (pathname, workstreamKey) => {
    expect(findNavigationItem(pathname)?.key).toBe(workstreamKey);
  });
});
