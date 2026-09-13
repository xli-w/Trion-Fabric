import { describe, expect, it } from 'vitest';

import { fabricNavigation, findNavigationItem } from '@config';

describe('workstream navigation', () => {
  it('exposes a workspace entry alongside coherent grouped workstreams', () => {
    expect(fabricNavigation.map((item) => item.label)).toEqual([
      'Workspace',
      'Client engagements',
      'Sites & site walks',
      'Transformation',
      'Diagnosis & outputs',
    ]);
  });

  it.each([
    ['/workspace', 'workspace'],
    ['/clients/client-northbank-precision', 'engagements'],
    ['/site-walks/walk-northbank-machine-shop-01', 'operations'],
    ['/roadmap/initiative-handover-foundation', 'transformation'],
    ['/outputs/output-northbank-transformation-roadmap', 'diagnosis-outputs'],
  ])('maps %s to the %s workstream', (pathname, workstreamKey) => {
    expect(findNavigationItem(pathname)?.key).toBe(workstreamKey);
  });
});
