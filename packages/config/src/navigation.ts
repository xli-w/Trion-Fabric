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
      'The active engagement: current understanding, priority work, and the next useful action.',
    routePrefixes: ['/workspace', '/knowledge'],
    sections: [{ label: 'Active workspace', path: '/workspace' }],
  },
  {
    key: 'understand',
    label: 'Understand',
    path: '/understand',
    description:
      'Investigate the operating environment through site walks, contextual evidence, and the digital landscape.',
    routePrefixes: ['/understand', '/site-walks', '/landscape', '/evidence'],
    sections: [
      { label: 'Site walk', path: '/site-walks' },
      { label: 'Evidence', path: '/evidence' },
      { label: 'Landscape', path: '/landscape' },
    ],
  },
  {
    key: 'analyse',
    label: 'Analyse',
    path: '/analyse',
    description:
      'Assess maturity, review evidence and findings, and develop evidence-led transformation opportunities.',
    routePrefixes: ['/analyse', '/diagnosis', '/opportunities'],
    sections: [
      { label: 'Diagnostic', path: '/diagnosis' },
      { label: 'Opportunities', path: '/opportunities' },
    ],
  },
  {
    key: 'plan-output',
    label: 'Plan & Output',
    path: '/plan-output',
    description:
      'Sequence recommendations, understand expected benefits, and prepare controlled client outputs.',
    routePrefixes: ['/plan-output', '/roadmap', '/benefits', '/outputs'],
    sections: [
      { label: 'Roadmap', path: '/roadmap' },
      { label: 'Benefits', path: '/benefits' },
      { label: 'Outputs', path: '/outputs' },
    ],
  },
  {
    key: 'clients',
    label: 'Clients',
    path: '/clients',
    description:
      'A lightweight library of client context, sites, and engagement history.',
    routePrefixes: ['/clients', '/sites', '/engagements'],
    sections: [{ label: 'Client library', path: '/clients' }],
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
  if (pathname.startsWith('/engagements/')) {
    return fabricNavigation.find((item) => item.key === 'workspace');
  }

  const allItems = [...fabricNavigation, ...utilityNavigation];
  return allItems.find((item) =>
    item.routePrefixes.some(
      (routePrefix) =>
        pathname === routePrefix || pathname.startsWith(`${routePrefix}/`),
    ),
  );
}
