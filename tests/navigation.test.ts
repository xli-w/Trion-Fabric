import { describe, expect, it } from 'vitest';

import { fabricNavigation, findNavigationItem } from '@config';

describe('workstream navigation', () => {
  it('exposes a workspace entry alongside coherent grouped workstreams', () => {
    expect(fabricNavigation.map((item) => item.label)).toEqual([
      'Workspace',
      'Clients & sites',
      'Transformation',
      'Diagnosis & outputs',
    ]);
  });

  it.each([
    ['/workspace', 'workspace'],
    ['/clients/client-northbank-precision', 'clients-sites'],
    ['/engagements/eng-northbank-diag', 'clients-sites'],
    ['/sites/site-northbank-main', 'clients-sites'],
    ['/site-walks/walk-northbank-machine-shop-01', 'clients-sites'],
    ['/roadmap/initiative-handover-foundation', 'transformation'],
    ['/outputs/output-northbank-transformation-roadmap', 'diagnosis-outputs'],
  ])('maps %s to the %s workstream', (pathname, workstreamKey) => {
    expect(findNavigationItem(pathname)?.key).toBe(workstreamKey);
  });
});
