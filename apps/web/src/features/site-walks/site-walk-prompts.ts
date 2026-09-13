export const siteWalkSections = [
  {
    key: 'briefing',
    title: 'Pre-tour briefing',
    prompts: ['Why is Trion visiting?', 'What does the client make or deliver?', 'What is the process flow from raw material to finished goods?', 'What are the production, commercial, and leadership priorities?', 'What pain points or hypotheses need testing?'],
  },
  {
    key: 'flow',
    title: 'Material and process flow',
    prompts: ['Raw material receiving', 'WIP and staging', 'Bottlenecks and idle inventory', 'Finished goods, shipping, and order verification', 'Process sequence and departmental handoffs'],
  },
  {
    key: 'data',
    title: 'Data and paper-tracking red flags',
    prompts: ['Paper travellers or clipboards', 'Manual whiteboards or spreadsheet trackers', 'Double data entry or verbal communication', 'Missing, duplicated, or delayed information'],
  },
  {
    key: 'machines',
    title: 'Machine operations and downtime',
    prompts: ['Downtime logging and fault escalation', 'Maintenance notification', 'Quality checks, scrap, and rework', 'Machine utilisation, operator systems, and production reporting'],
  },
  {
    key: 'diagnostic',
    title: 'High-impact diagnostic prompts',
    prompts: ['What happens when a machine goes down unexpectedly?', 'How is maintenance alerted?', 'Which manual administrative task would you eliminate?', 'How long until shift production numbers reach management?', 'What is most frustrating about shift changeover?', 'What always takes longer than it should?'],
  },
  {
    key: 'recap',
    title: 'Post-tour recap',
    prompts: ['Summarise the process flow.', 'What was validated, misunderstood, or corrected?', 'What is the confirmed bottleneck?', 'What immediate opportunities are visible?', 'What is the agreed next step and should a deeper diagnostic be recommended?'],
  },
] as const;
