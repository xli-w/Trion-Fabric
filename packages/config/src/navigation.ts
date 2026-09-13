export interface NavigationItem {
  key: string;
  label: string;
  path: string;
  description: string;
  status: 'available' | 'planned';
}

export const fabricNavigation: NavigationItem[] = [
  {
    key: 'home',
    label: 'Home',
    path: '/',
    description: 'Internal workspace overview and engagement pulse.',
    status: 'available',
  },
  {
    key: 'clients',
    label: 'Clients',
    path: '/clients',
    description: 'Client organisations, context, and engagement relationships.',
    status: 'available',
  },
  {
    key: 'sites',
    label: 'Sites',
    path: '/sites',
    description: 'Physical operating environments and operational context.',
    status: 'planned',
  },
  {
    key: 'engagements',
    label: 'Engagements',
    path: '/engagements',
    description: 'Transformation assignments connecting clients, sites, and workstreams.',
    status: 'available',
  },
  {
    key: 'site-walks',
    label: 'Site Walks',
    path: '/site-walks',
    description: 'Structured evidence capture and follow-up activity.',
    status: 'available',
  },
  {
    key: 'landscape',
    label: 'Landscape',
    path: '/landscape',
    description: 'Processes, systems, and operational relationships.',
    status: 'planned',
  },
  {
    key: 'diagnosis',
    label: 'Diagnosis',
    path: '/diagnosis',
    description: 'Diagnostic scoring, findings, and evidence-linked conclusions.',
    status: 'planned',
  },
  {
    key: 'opportunities',
    label: 'Opportunities',
    path: '/opportunities',
    description: 'Problem-led opportunities linked to evidence and delivery.',
    status: 'available',
  },
  {
    key: 'roadmap',
    label: 'Roadmap',
    path: '/roadmap',
    description: 'Initiatives, actions, sequencing, and delivery status.',
    status: 'planned',
  },
  {
    key: 'outputs',
    label: 'Outputs',
    path: '/outputs',
    description: 'Controlled draft, review, approval, and shared outputs.',
    status: 'available',
  },
  {
    key: 'settings',
    label: 'Settings',
    path: '/settings',
    description: 'Configuration seams for users, taxonomies, and environment controls.',
    status: 'planned',
  },
];

export function findNavigationItem(pathname: string): NavigationItem | undefined {
  if (pathname === '/') {
    return fabricNavigation[0];
  }

  return fabricNavigation.find((item) => item.path !== '/' && pathname.startsWith(item.path));
}