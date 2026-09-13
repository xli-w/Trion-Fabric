import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from '@app/layouts/AppShell';
import { ClientsPage } from '@app/pages/ClientsPage';
import { ClientDetailPage } from '@app/pages/ClientsPage';
import { EngagementsPage } from '@app/pages/EngagementsPage';
import { EngagementDetailPage } from '@app/pages/EngagementDetailPage';
import { OpportunitiesPage } from '@app/pages/OpportunitiesPage';
import { OutputsPage } from '@app/pages/OutputsPage';
import { PlannedPage } from '@app/pages/PlannedPage';
import { SiteWalksPage } from '@app/pages/SiteWalksPage';
import { WorkspacePage } from '@app/pages/WorkspacePage';
import { SiteDetailPage, SitesPage } from '@app/pages/SitesPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />} path="/">
          <Route element={<WorkspacePage />} index />
          <Route element={<ClientsPage />} path="clients" />
          <Route element={<ClientDetailPage />} path="clients/:clientId" />
          <Route element={<SitesPage />} path="sites" />
          <Route element={<SiteDetailPage />} path="sites/:siteId" />
          <Route element={<EngagementsPage />} path="engagements" />
          <Route element={<EngagementDetailPage />} path="engagements/:engagementId" />
          <Route element={<SiteWalksPage />} path="site-walks" />
          <Route
            element={
              <PlannedPage
                title="Landscape"
                description="Model how areas, processes, systems, equipment, and data flows interact so the digital landscape map is generated from structure rather than drawings."
                plannedCapabilities={[
                  'process and system relationships with reusable references',
                  'evidence-linked process decomposition and dependencies',
                  'future visual landscape output generated from structured entities',
                ]}
              />
            }
            path="landscape"
          />
          <Route
            element={
              <PlannedPage
                title="Diagnosis"
                description="Evidence-linked maturity assessment and diagnostic conclusions will sit here once the scoring and review model are implemented."
                plannedCapabilities={[
                  'configurable maturity dimensions and questions',
                  'evidence-linked scoring and approval states',
                  'diagnostic findings connected to opportunities and outputs',
                ]}
              />
            }
            path="diagnosis"
          />
          <Route element={<OpportunitiesPage />} path="opportunities" />
          <Route
            element={
              <PlannedPage
                title="Roadmap"
                description="Fabric will turn approved opportunities into initiatives, sequencing, and measurable delivery rather than becoming a disconnected project tracker."
                plannedCapabilities={[
                  'initiative sequencing tied to approved opportunities',
                  'action ownership, dependencies, and milestone tracking',
                  'expected and realised benefits in one delivery model',
                ]}
              />
            }
            path="roadmap"
          />
          <Route element={<OutputsPage />} path="outputs" />
          <Route
            element={
              <PlannedPage
                title="Settings"
                description="Configuration seams for taxonomies, roles, repository sources, and future environment controls will live here."
                plannedCapabilities={[
                  'engagement types, workflow taxonomies, and approval defaults',
                  'future role and permission configuration surfaces',
                  'environment-level data source and integration settings',
                ]}
              />
            }
            path="settings"
          />
        </Route>
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </BrowserRouter>
  );
}