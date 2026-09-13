import { NavLink, Outlet, useLocation } from 'react-router-dom';

import { fabricNavigation, findNavigationItem, productInfo } from '@config';
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

        <nav className="sidebar-nav" aria-label="Primary">
          {fabricNavigation.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              aria-current={currentPage?.key === item.key ? 'page' : undefined}
              className={({ isActive }) =>
                [
                  'sidebar-nav__link',
                  isActive || currentPage?.key === item.key
                    ? 'sidebar-nav__link--active'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')
              }
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div>
            <div className="breadcrumbs">
              <span>Fabric</span>
              <span>/</span>
              <span>{currentPage?.label ?? 'Fabric'}</span>
            </div>
            <h2 className="topbar-title">
              {currentPage?.label ?? productInfo.fullName}
            </h2>
            <p className="topbar-description">{currentPage?.description}</p>
          </div>

          <div className="topbar-actions">
            <Badge tone="neutral">{repositorySource.label}</Badge>
            <Button
              disabled={isLoading}
              onClick={() => void refresh()}
              variant="secondary"
            >
              {isLoading ? 'Refreshing...' : 'Refresh fixtures'}
            </Button>
          </div>
        </header>

        {currentPage ? (
          <nav
            className="workstream-nav"
            aria-label={`${currentPage.label} sections`}
          >
            {currentPage.sections.map((section) => (
              <NavLink
                key={section.path}
                to={section.path}
                className={({ isActive }) =>
                  [
                    'workstream-nav__link',
                    isActive ? 'workstream-nav__link--active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')
                }
              >
                {section.label}
              </NavLink>
            ))}
          </nav>
        ) : null}

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
