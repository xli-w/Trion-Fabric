export interface WorkstreamSection {
  label: string;
  path: string;
}

export interface NavigationItem {
  key: string;
  label: string;
  path: string;
  description: string;
  routePrefixes: string[];
  sections: WorkstreamSection[];
}

export const fabricNavigation: NavigationItem[] = [
  {
    key: 'workspace',
    label: 'Workspace',
    path: '/workspace',
    description:
      'Your active transformation work, review queue, reusable internal knowledge, and next useful action.',
    routePrefixes: ['/workspace', '/knowledge'],
    sections: [
      { label: 'Work queue', path: '/workspace' },
      { label: 'Reusable knowledge', path: '/knowledge' },
    ],
  },
  {
    key: 'clients',
    label: 'Clients',
    path: '/clients',
    description:
      'Client organisations, scoped transformation engagements, and operating manufacturing sites.',
    routePrefixes: ['/clients', '/engagements', '/sites'],
    sections: [
      { label: 'Clients', path: '/clients' },
      { label: 'Engagements', path: '/engagements' },
      { label: 'Sites', path: '/sites' },
    ],
  },
  {
    key: 'diagnosis',
    label: 'Diagnosis',
    path: '/diagnosis',
    description:
      'Operational maturity assessment, factory site walks, traceable evidence, digital landscape mapping, and diagnostic findings.',
    routePrefixes: ['/diagnosis', '/site-walks', '/landscape', '/evidence'],
    sections: [
      { label: 'Diagnosis', path: '/diagnosis' },
      { label: 'Site walks', path: '/site-walks' },
      { label: 'Evidence library', path: '/evidence' },
      { label: 'Landscape', path: '/landscape' },
    ],
  },
  {
    key: 'transformation',
    label: 'Transformation',
    path: '/opportunities',
    description:
      'Prioritised transformation opportunities, sequenced roadmap delivery, and controlled client deliverables.',
    routePrefixes: ['/opportunities', '/roadmap', '/outputs'],
    sections: [
      { label: 'Opportunities', path: '/opportunities' },
      { label: 'Roadmap', path: '/roadmap' },
      { label: 'Outputs', path: '/outputs' },
    ],
  },
];

export const utilityNavigation: NavigationItem[] = [
  {
    key: 'settings',
    label: 'Settings',
    path: '/settings',
    description:
      'Platform appearance, Pure Black / Trion Purple theme, and workspace controls.',
    routePrefixes: ['/settings'],
    sections: [{ label: 'General & appearance', path: '/settings' }],
  },
];

export function findNavigationItem(
  pathname: string,
): NavigationItem | undefined {
  const allItems = [...fabricNavigation, ...utilityNavigation];
  return allItems.find((item) =>
    item.routePrefixes.some(
      (routePrefix) =>
        pathname === routePrefix || pathname.startsWith(`${routePrefix}/`),
    ),
  );
}
