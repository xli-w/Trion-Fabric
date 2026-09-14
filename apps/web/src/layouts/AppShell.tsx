import { useEffect, useState } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { Bell, Moon, Search, Settings, Sun, UserRound } from 'lucide-react';

import { fabricNavigation, findNavigationItem, productInfo } from '@config';
import { Badge, Button, useTheme } from '@ui';

import { useFabricData } from '@app/features/fabric-data/FabricDataContext';
import {
  activeWorkspacePath,
  withEngagementContext,
} from '@app/features/fabric-data/engagement-paths';
import {
  buildBreadcrumbs,
  buildGlobalSearchResults,
  buildWorkspaceSnapshot,
  resolveEngagementIdForPath,
} from '@app/features/fabric-data/selectors';

function workspaceRoleLabel(role?: string) {
  return role === 'administrator' ? 'Trion Admin' : 'Trion User';
}

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPage = findNavigationItem(location.pathname);
  const {
    activeClient,
    activeDataset,
    activeEngagement,
    activeEngagementId,
    activeSites,
    currentUser,
    dataset,
    isLoading,
    refresh,
    repositorySource,
    setActiveEngagementId,
    setCurrentUserId,
  } = useFabricData();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const workspaceDataset = activeDataset ?? dataset;
  const isDevelopmentWorkspace =
    repositorySource.kind === 'development-fixtures';
  const routeEngagementId = dataset
    ? resolveEngagementIdForPath(dataset, location.pathname, location.search)
    : undefined;

  useEffect(() => {
    if (!dataset) {
      return;
    }

    if (routeEngagementId && routeEngagementId !== activeEngagementId) {
      setActiveEngagementId(routeEngagementId);
    }
  }, [activeEngagementId, dataset, routeEngagementId, setActiveEngagementId]);

  const breadcrumbs = dataset
    ? buildBreadcrumbs(
        dataset,
        location.pathname,
        currentPage?.label ?? productInfo.fullName,
        routeEngagementId ?? activeEngagementId ?? undefined,
      )
    : [{ label: 'Fabric' }];
  const searchResults = workspaceDataset
    ? currentUser
      ? buildGlobalSearchResults(workspaceDataset, searchQuery, currentUser)
      : []
    : [];
  const reviewCount = workspaceDataset
    ? buildWorkspaceSnapshot(workspaceDataset, currentUser?.id).reviewCount
    : 0;
  const activeSiteLabel =
    activeSites.length > 0
      ? activeSites.map((site) => site.name).join(', ')
      : 'No site selected';

  function selectActiveEngagement(value: string) {
    const engagementId = value || null;
    setActiveEngagementId(engagementId);
    navigate(engagementId ? `/workspace/${engagementId}` : '/clients');
  }

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
              to={
                item.key === 'clients'
                  ? item.path
                  : item.key === 'workspace'
                    ? activeWorkspacePath(activeEngagementId)
                    : withEngagementContext(item.path, activeEngagementId)
              }
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

        <div className="sidebar-footer">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              ['sidebar-nav__link', isActive ? 'sidebar-nav__link--active' : '']
                .filter(Boolean)
                .join(' ')
            }
          >
            <span className="sidebar-footer__settings">
              <Settings size={16} />
              Settings and theme
            </span>
            <Badge tone="accent">
              {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
            </Badge>
          </NavLink>
          <div className="sidebar-footer__version">
            Fabric Engine v0.1.0 · Trion Transformation
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-context">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, index) => (
                <span
                  className="breadcrumbs__item"
                  key={`${crumb.label}-${index}`}
                >
                  {index > 0 ? <span aria-hidden="true">/</span> : null}
                  {crumb.path && index < breadcrumbs.length - 1 ? (
                    <Link to={crumb.path}>{crumb.label}</Link>
                  ) : (
                    <span
                      aria-current={
                        index === breadcrumbs.length - 1 ? 'page' : undefined
                      }
                    >
                      {crumb.label}
                    </span>
                  )}
                </span>
              ))}
            </nav>
            <h2 className="topbar-title">
              {currentPage?.label ?? productInfo.fullName}
            </h2>
            <p className="topbar-description">{currentPage?.description}</p>
            <div className="active-engagement-context">
              <div>
                <span className="active-engagement-context__label">
                  Active engagement
                </span>
                <strong>
                  {activeEngagement?.name ?? 'Choose an engagement'}
                </strong>
                <small>
                  {activeClient
                    ? `${activeClient.name} · ${activeSiteLabel}`
                    : 'Choose a client engagement to begin focused work.'}
                </small>
              </div>
              <label className="sr-only" htmlFor="active-engagement">
                Active client engagement
              </label>
              <select
                disabled={!dataset}
                id="active-engagement"
                onChange={(event) => selectActiveEngagement(event.target.value)}
                value={activeEngagementId ?? ''}
              >
                <option value="">Choose engagement</option>
                {dataset?.engagements.map((engagement) => {
                  const client = dataset.clients.find(
                    (item) => item.id === engagement.clientId,
                  );
                  return (
                    <option key={engagement.id} value={engagement.id}>
                      {client?.name ?? 'Unknown client'} · {engagement.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="global-search">
              <label className="sr-only" htmlFor="global-search">
                Search Fabric records
              </label>
              <Search aria-hidden="true" size={16} />
              <input
                autoComplete="off"
                id="global-search"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={
                  activeEngagement
                    ? 'Search this engagement...'
                    : 'Search accessible work...'
                }
                type="search"
                value={searchQuery}
              />
              {searchQuery.trim() ? (
                <div className="global-search__results" role="listbox">
                  {searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <Link
                        className="global-search__result"
                        key={`${result.type}-${result.id}`}
                        onClick={() => setSearchQuery('')}
                        role="option"
                        to={result.path}
                      >
                        <span>
                          <strong>{result.label}</strong>
                          <small>{result.context}</small>
                        </span>
                        <Badge tone="neutral">{result.type}</Badge>
                      </Link>
                    ))
                  ) : (
                    <p className="global-search__empty" role="status">
                      No matching internal records.
                    </p>
                  )}
                </div>
              ) : null}
            </div>

            <Link
              aria-label={`${reviewCount} items need review`}
              className="review-indicator"
              to={activeWorkspacePath(activeEngagementId)}
            >
              <Bell aria-hidden="true" size={17} />
              <Badge tone={reviewCount > 0 ? 'warning' : 'neutral'}>
                {reviewCount}
              </Badge>
            </Link>

            <div className="current-user-context">
              <UserRound aria-hidden="true" size={17} />
              <div>
                <strong>{currentUser?.displayName ?? 'Loading user'}</strong>
                <span>{workspaceRoleLabel(currentUser?.role)}</span>
              </div>
              {isDevelopmentWorkspace ? (
                <>
                  <label className="sr-only" htmlFor="current-user">
                    Current internal user
                  </label>
                  <select
                    disabled={!dataset || !currentUser}
                    id="current-user"
                    onChange={(event) => setCurrentUserId(event.target.value)}
                    value={currentUser?.id ?? ''}
                  >
                    {dataset?.users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.displayName} ({workspaceRoleLabel(user.role)})
                      </option>
                    ))}
                  </select>
                </>
              ) : null}
            </div>

            <button
              type="button"
              className="theme-quick-toggle"
              onClick={toggleTheme}
              title={`Switch to ${
                resolvedTheme === 'dark' ? 'Light' : 'Pure Black Dark'
              } mode`}
              aria-label="Toggle theme mode"
            >
              {resolvedTheme === 'dark' ? (
                <Sun
                  className="theme-quick-toggle__icon theme-quick-toggle__icon--sun"
                  size={18}
                />
              ) : (
                <Moon
                  className="theme-quick-toggle__icon theme-quick-toggle__icon--moon"
                  size={18}
                />
              )}
            </button>
            {isDevelopmentWorkspace ? (
              <>
                <Badge tone="neutral">{repositorySource.label}</Badge>
                <Button
                  disabled={isLoading}
                  onClick={() => void refresh()}
                  variant="secondary"
                >
                  {isLoading ? 'Refreshing...' : 'Refresh fixtures'}
                </Button>
              </>
            ) : null}
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
                to={
                  section.path === '/workspace'
                    ? activeWorkspacePath(activeEngagementId)
                    : withEngagementContext(
                        section.path,
                        currentPage.key === 'clients'
                          ? undefined
                          : activeEngagementId,
                      )
                }
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
