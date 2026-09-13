import { describe, expect, it } from 'vitest';

import { fabricNavigation, findNavigationItem } from '@config';

describe('workstream navigation', () => {
  it('exposes a workspace entry alongside coherent grouped workstreams', () => {
    expect(fabricNavigation.map((item) => item.label)).toEqual([
      'Workspace',
      'Clients',
      'Diagnosis',
      'Transformation',
    ]);
  });

  it.each([
    ['/workspace', 'workspace'],
    ['/clients', 'clients'],
    ['/clients/client-northbank-precision', 'clients'],
    ['/engagements', 'clients'],
    ['/engagements/eng-northbank-diag', 'clients'],
    ['/sites', 'clients'],
    ['/sites/site-northbank-main', 'clients'],
    ['/diagnosis', 'diagnosis'],
    ['/site-walks', 'diagnosis'],
    ['/site-walks/walk-northbank-machine-shop-01', 'diagnosis'],
    ['/landscape', 'diagnosis'],
    ['/evidence', 'diagnosis'],
    ['/opportunities', 'transformation'],
    ['/opportunities/opp-handover-standardisation', 'transformation'],
    ['/roadmap', 'transformation'],
    ['/roadmap/initiative-handover-foundation', 'transformation'],
    ['/outputs', 'transformation'],
    ['/outputs/output-northbank-transformation-roadmap', 'transformation'],
    ['/knowledge', 'workspace'],
  ])('maps %s to the %s workstream', (pathname, workstreamKey) => {
    expect(findNavigationItem(pathname)?.key).toBe(workstreamKey);
  });
});
