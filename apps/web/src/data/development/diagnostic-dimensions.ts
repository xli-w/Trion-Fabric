import type { DiagnosticDimension } from '@domain';

const timestamp = '2026-09-01T09:00:00Z';
const anchorNames = ['Reactive', 'Developing', 'Controlled', 'Integrated', 'Optimised'];
const descriptions = [
  'Business objectives, digital direction, investment logic, improvement pipeline, leadership support, and ownership.',
  'Digital skills, training, adoption, process ownership, employee involvement, and internal technical capability.',
  'Documented processes, standard work, variation, duplicate activity, bottlenecks, rework, and simplification.',
  'Production visibility, downtime, quality, scrap, utilisation, escalation, and shopfloor information.',
  'Scheduling, capacity, material availability, inventory, prioritisation, adherence, and bottleneck management.',
  'Data availability, accuracy, ownership, reporting, KPIs, historical analysis, and data-led decisions.',
  'ERP utilisation, master data, transactions, inventory, reporting, unused functionality, and spreadsheet workarounds.',
  'System integration, information latency, duplicate entry, APIs, data transfer, and data silos.',
  'Workflow and machine automation, data collection, sensors, digital tools, maintenance, ROI, and scalability.',
  'Improvement culture, root-cause analysis, ownership, benefits tracking, change management, and replication.',
];
const names = [
  'Strategy & Digital Direction',
  'People & Digital Capability',
  'Processes & Standardisation',
  'Production & Operational Control',
  'Planning & Scheduling',
  'Data & Performance Intelligence',
  'Systems & ERP',
  'Integration & Information Flow',
  'Automation & Technology',
  'Continuous Improvement & Scalability',
];

export const diagnosticDimensions: DiagnosticDimension[] = names.map((name, index) => ({
  id: `dimension-${index + 1}`,
  createdAt: timestamp,
  updatedAt: timestamp,
  key: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  name,
  version: '2026.1',
  description: descriptions[index],
  criteria: descriptions[index].split(', ').map((criterion) => criterion.replace(/\.$/, '')),
  anchors: Object.fromEntries(anchorNames.map((level, levelIndex) => [
    String(levelIndex + 1),
    `${level}: assess the fit between current practice, evidence, and operational need.`,
  ])),
}));
