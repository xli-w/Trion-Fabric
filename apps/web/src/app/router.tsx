import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from 'react-router-dom';

import { AppShell } from '@app/layouts/AppShell';
import { AnalysePage } from '@app/pages/AnalysePage';
import { BenefitsPage } from '@app/pages/BenefitsPage';
import { ClientDetailPage, ClientsPage } from '@app/pages/ClientsPage';
import { DiagnosisPage } from '@app/pages/DiagnosisPage';
import { EngagementsPage } from '@app/pages/EngagementsPage';
import { EvidenceLibraryPage } from '@app/pages/EvidenceLibraryPage';
import { KnowledgePage } from '@app/pages/KnowledgePage';
import { LandscapePage } from '@app/pages/LandscapePage';
import {
  OpportunitiesPage,
  OpportunityDetailPage,
} from '@app/pages/OpportunitiesPage';
import { OutputDetailPage, OutputsPage } from '@app/pages/OutputsPage';
import { PlanOutputPage } from '@app/pages/PlanOutputPage';
import { InitiativeDetailPage, RoadmapPage } from '@app/pages/RoadmapPage';
import { SettingsPage } from '@app/pages/SettingsPage';
import { SiteDetailPage, SitesPage } from '@app/pages/SitesPage';
import { SiteWalksPage, SiteWalkWorkspacePage } from '@app/pages/SiteWalksPage';
import { UnderstandPage } from '@app/pages/UnderstandPage';
import { WorkspacePage } from '@app/pages/WorkspacePage';

function LegacyEngagementRedirect() {
  const { engagementId } = useParams();

  return (
    <Navigate
      replace
      to={engagementId ? `/workspace/${engagementId}` : '/workspace'}
    />
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />} path="/">
          <Route element={<Navigate replace to="workspace" />} index />
          <Route element={<WorkspacePage />} path="workspace" />
          <Route element={<WorkspacePage />} path="workspace/:engagementId" />
          <Route element={<UnderstandPage />} path="understand" />
          <Route element={<AnalysePage />} path="analyse" />
          <Route element={<PlanOutputPage />} path="plan-output" />
          <Route element={<ClientsPage />} path="clients" />
          <Route element={<ClientDetailPage />} path="clients/:clientId" />
          <Route element={<SitesPage />} path="sites" />
          <Route element={<SiteDetailPage />} path="sites/:siteId" />
          <Route element={<EngagementsPage />} path="engagements" />
          <Route
            element={<LegacyEngagementRedirect />}
            path="engagements/:engagementId"
          />
          <Route element={<SiteWalksPage />} path="site-walks" />
          <Route
            element={<SiteWalkWorkspacePage />}
            path="site-walks/:siteWalkId"
          />
          <Route element={<LandscapePage />} path="landscape" />
          <Route element={<EvidenceLibraryPage />} path="evidence" />
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
          <Route element={<BenefitsPage />} path="benefits" />
          <Route element={<OutputsPage />} path="outputs" />
          <Route element={<OutputDetailPage />} path="outputs/:outputId" />
          <Route element={<SettingsPage />} path="settings" />
          <Route element={<KnowledgePage />} path="knowledge" />
        </Route>
        <Route element={<Navigate replace to="/workspace" />} path="*" />
      </Routes>
    </BrowserRouter>
  );
}
