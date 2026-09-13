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
      'Your active transformation work, review queue, upcoming fieldwork, and next useful action.',
    routePrefixes: ['/workspace'],
    sections: [{ label: 'Work queue', path: '/workspace' }],
  },
  {
    key: 'clients-sites',
    label: 'Clients & sites',
    path: '/engagements',
    description:
      'Client organisations, scoped transformation engagements, operating sites, and structured fieldwork.',
    routePrefixes: ['/engagements', '/clients', '/sites', '/site-walks'],
    sections: [
      { label: 'Engagements', path: '/engagements' },
      { label: 'Clients', path: '/clients' },
      { label: 'Sites', path: '/sites' },
      { label: 'Site walks', path: '/site-walks' },
    ],
  },
  {
    key: 'transformation',
    label: 'Transformation',
    path: '/opportunities',
    description:
      'Landscape context, prioritised improvements, and sequenced delivery initiatives.',
    routePrefixes: ['/landscape', '/opportunities', '/roadmap'],
    sections: [
      { label: 'Landscape', path: '/landscape' },
      { label: 'Opportunities', path: '/opportunities' },
      { label: 'Roadmap', path: '/roadmap' },
    ],
  },
  {
    key: 'diagnosis-outputs',
    label: 'Diagnosis & outputs',
    path: '/diagnosis',
    description:
      'Maturity assessment, findings, and controlled engagement deliverables.',
    routePrefixes: ['/diagnosis', '/outputs'],
    sections: [
      { label: 'Diagnosis', path: '/diagnosis' },
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
