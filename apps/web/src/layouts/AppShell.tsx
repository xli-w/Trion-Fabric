import { NavLink, Outlet, useLocation } from 'react-router-dom';

import { fabricNavigation, findNavigationItem, productInfo, transformationLifecycle } from '@config';
import { Badge, Button } from '@ui';

import { useFabricData } from '@app/features/fabric-data/FabricDataContext';

export function AppShell() {
  const location = useLocation();
  const currentPage = findNavigationItem(location.pathname);
  const { isLoading, refresh, repositorySource } = useFabricData();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="brand-block">
          <div className="brand-mark">F</div>
          <div>
            <p className="brand-kicker">Trion internal platform</p>
            <h1 className="brand-title">{productInfo.fullName}</h1>
            <p className="brand-subtitle">{productInfo.strapline}</p>
          </div>
        </div>

        <section className="sidebar-panel">
          <Badge tone="accent">Internal workspace</Badge>
          <p className="sidebar-flow">{transformationLifecycle.join(' -> ')}</p>
          <p className="sidebar-copy">
            Capture information once, structure it properly, connect it intelligently, and reuse it.
          </p>
        </section>

        <nav className="sidebar-nav" aria-label="Primary">
          {fabricNavigation.map((item) => (
            <NavLink
              key={item.key}
              end={item.path === '/'}
              to={item.path}
              className={({ isActive }) =>
                ['sidebar-nav__link', isActive ? 'sidebar-nav__link--active' : '']
                  .filter(Boolean)
                  .join(' ')
              }
            >
              <span>{item.label}</span>
              {item.status === 'planned' ? <span className="sidebar-nav__status">Planned</span> : null}
            </NavLink>
          ))}
        </nav>

        <section className="sidebar-panel sidebar-panel--footer">
          <p className="sidebar-footnote-label">Architectural guardrail</p>
          <p className="sidebar-copy">Reports and client outputs should only sit downstream of approved domain data.</p>
        </section>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div>
            <div className="breadcrumbs">
              <span>Fabric</span>
              <span>/</span>
              <span>{currentPage?.label ?? 'Home'}</span>
            </div>
            <h2 className="topbar-title">{currentPage?.label ?? 'Home'}</h2>
            <p className="topbar-description">{currentPage?.description}</p>
          </div>

          <div className="topbar-actions">
            <Badge tone="neutral">{repositorySource.label}</Badge>
            <Button disabled={isLoading} onClick={() => void refresh()} variant="secondary">
              {isLoading ? 'Refreshing...' : 'Refresh fixtures'}
            </Button>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}