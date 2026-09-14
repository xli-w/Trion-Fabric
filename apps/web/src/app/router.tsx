import { lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from 'react-router-dom';

import { AppShell } from '@app/layouts/AppShell';

const WorkspacePage = lazy(async () => {
  const module = await import('@app/pages/WorkspacePage');
  return { default: module.WorkspacePage };
});
const UnderstandPage = lazy(async () => {
  const module = await import('@app/pages/UnderstandPage');
  return { default: module.UnderstandPage };
});
const AnalysePage = lazy(async () => {
  const module = await import('@app/pages/AnalysePage');
  return { default: module.AnalysePage };
});
const PlanOutputPage = lazy(async () => {
  const module = await import('@app/pages/PlanOutputPage');
  return { default: module.PlanOutputPage };
});
const ClientsPage = lazy(async () => {
  const module = await import('@app/pages/ClientsPage');
  return { default: module.ClientsPage };
});
const ClientDetailPage = lazy(async () => {
  const module = await import('@app/pages/ClientsPage');
  return { default: module.ClientDetailPage };
});
const SitesPage = lazy(async () => {
  const module = await import('@app/pages/SitesPage');
  return { default: module.SitesPage };
});
const SiteDetailPage = lazy(async () => {
  const module = await import('@app/pages/SitesPage');
  return { default: module.SiteDetailPage };
});
const EngagementsPage = lazy(async () => {
  const module = await import('@app/pages/EngagementsPage');
  return { default: module.EngagementsPage };
});
const SiteWalksPage = lazy(async () => {
  const module = await import('@app/pages/SiteWalksPage');
  return { default: module.SiteWalksPage };
});
const SiteWalkWorkspacePage = lazy(async () => {
  const module = await import('@app/pages/SiteWalksPage');
  return { default: module.SiteWalkWorkspacePage };
});
const LandscapePage = lazy(async () => {
  const module = await import('@app/pages/LandscapePage');
  return { default: module.LandscapePage };
});
const EvidenceLibraryPage = lazy(async () => {
  const module = await import('@app/pages/EvidenceLibraryPage');
  return { default: module.EvidenceLibraryPage };
});
const DiagnosisPage = lazy(async () => {
  const module = await import('@app/pages/DiagnosisPage');
  return { default: module.DiagnosisPage };
});
const OpportunitiesPage = lazy(async () => {
  const module = await import('@app/pages/OpportunitiesPage');
  return { default: module.OpportunitiesPage };
});
const OpportunityDetailPage = lazy(async () => {
  const module = await import('@app/pages/OpportunitiesPage');
  return { default: module.OpportunityDetailPage };
});
const RoadmapPage = lazy(async () => {
  const module = await import('@app/pages/RoadmapPage');
  return { default: module.RoadmapPage };
});
const InitiativeDetailPage = lazy(async () => {
  const module = await import('@app/pages/RoadmapPage');
  return { default: module.InitiativeDetailPage };
});
const BenefitsPage = lazy(async () => {
  const module = await import('@app/pages/BenefitsPage');
  return { default: module.BenefitsPage };
});
const OutputsPage = lazy(async () => {
  const module = await import('@app/pages/OutputsPage');
  return { default: module.OutputsPage };
});
const OutputDetailPage = lazy(async () => {
  const module = await import('@app/pages/OutputsPage');
  return { default: module.OutputDetailPage };
});
const SettingsPage = lazy(async () => {
  const module = await import('@app/pages/SettingsPage');
  return { default: module.SettingsPage };
});
const KnowledgePage = lazy(async () => {
  const module = await import('@app/pages/KnowledgePage');
  return { default: module.KnowledgePage };
});

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
      <Suspense
        fallback={
          <main className="route-loading" role="status">
            Loading workbench...
          </main>
        }
      >
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
      </Suspense>
    </BrowserRouter>
  );
}
