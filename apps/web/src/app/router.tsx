import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from '@app/layouts/AppShell';
import { ClientsPage } from '@app/pages/ClientsPage';
import { ClientDetailPage } from '@app/pages/ClientsPage';
import { EngagementsPage } from '@app/pages/EngagementsPage';
import { EngagementDetailPage } from '@app/pages/EngagementDetailPage';
import {
  OpportunitiesPage,
  OpportunityDetailPage,
} from '@app/pages/OpportunitiesPage';
import { OutputDetailPage, OutputsPage } from '@app/pages/OutputsPage';
import { PlannedPage } from '@app/pages/PlannedPage';
import { SiteWalksPage, SiteWalkWorkspacePage } from '@app/pages/SiteWalksPage';
import { WorkspacePage } from '@app/pages/WorkspacePage';
import { SiteDetailPage, SitesPage } from '@app/pages/SitesPage';
import { DiagnosisPage } from '@app/pages/DiagnosisPage';
import { LandscapePage } from '@app/pages/LandscapePage';
import { InitiativeDetailPage, RoadmapPage } from '@app/pages/RoadmapPage';

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
          <Route
            element={<EngagementDetailPage />}
            path="engagements/:engagementId"
          />
          <Route element={<SiteWalksPage />} path="site-walks" />
          <Route
            element={<SiteWalkWorkspacePage />}
            path="site-walks/:siteWalkId"
          />
          <Route element={<LandscapePage />} path="landscape" />
          <Route element={<DiagnosisPage />} path="diagnosis" />
          <Route element={<OpportunitiesPage />} path="opportunities" />
          <Route
            element={<OpportunityDetailPage />}
            path="opportunities/:opportunityId"
          />
          <Route element={<RoadmapPage />} path="roadmap" />
          <Route
            element={<InitiativeDetailPage />}
            path="roadmap/:initiativeId"
          />
          <Route element={<OutputsPage />} path="outputs" />
          <Route element={<OutputDetailPage />} path="outputs/:outputId" />
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
