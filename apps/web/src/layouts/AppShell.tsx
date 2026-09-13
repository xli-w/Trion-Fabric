import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Bell, Moon, Search, Settings, Sun, UserRound } from 'lucide-react';

import { fabricNavigation, findNavigationItem, productInfo } from '@config';
import { Badge, Button, useTheme } from '@ui';

import { useFabricData } from '@app/features/fabric-data/FabricDataContext';
import {
  buildBreadcrumbs,
  buildGlobalSearchResults,
  buildWorkspaceSnapshot,
} from '@app/features/fabric-data/selectors';

export function AppShell() {
  const location = useLocation();
  const currentPage = findNavigationItem(location.pathname);
  const {
    currentUser,
    dataset,
    isLoading,
    refresh,
    repositorySource,
    setCurrentUserId,
  } = useFabricData();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const breadcrumbs = dataset
    ? buildBreadcrumbs(
        dataset,
        location.pathname,
        currentPage?.label ?? productInfo.fullName,
      )
    : [{ label: 'Fabric' }];
  const searchResults = dataset
    ? currentUser
      ? buildGlobalSearchResults(dataset, searchQuery, currentUser)
      : []
    : [];
  const reviewCount = dataset
    ? buildWorkspaceSnapshot(dataset, currentUser?.id).reviewCount
    : 0;

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
                placeholder="Search evidence, work, and knowledge..."
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
              to="/workspace"
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
                <span>
                  {currentUser?.role
                    ? currentUser.role
                        .split('-')
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ')
                    : 'Internal user'}
                </span>
              </div>
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
                    {user.displayName} (
                    {user.role
                      .split('-')
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' ')}
                    )
                  </option>
                ))}
              </select>
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
