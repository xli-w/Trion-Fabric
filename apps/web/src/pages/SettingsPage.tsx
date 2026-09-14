import { Laptop, Moon, RefreshCw, Sun } from 'lucide-react';

import { Badge, Button, Card, PageHeader, type ThemeMode, useTheme } from '@ui';

import { useFabricData } from '@app/features/fabric-data/FabricDataContext';

const themeOptions: Array<{
  id: ThemeMode;
  label: string;
  description: string;
  icon: typeof Sun;
}> = [
  {
    id: 'dark',
    label: 'Pure black dark',
    description: 'Dark workbench surfaces with the Trion purple accent.',
    icon: Moon,
  },
  {
    id: 'light',
    label: 'Light precision',
    description: 'High-clarity light surfaces with the Trion pine accent.',
    icon: Sun,
  },
  {
    id: 'system',
    label: 'System preference',
    description: 'Follow the operating-system appearance setting.',
    icon: Laptop,
  },
];

export function SettingsPage() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { dataset, isLoading, refresh, repositorySource } = useFabricData();
  const isDevelopmentWorkspace =
    repositorySource.kind === 'development-fixtures';

  function refreshWorkspace() {
    void refresh();
  }

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Personal and workspace settings"
        description="Keep everyday consulting work in the active engagement. This utility area holds only personal appearance and local development data controls."
        metadata={[
          resolvedTheme === 'dark' ? 'Pure black dark' : 'Light precision',
          repositorySource.label,
        ]}
      />

      <section className="content-grid content-grid--two">
        <Card
          title="Appearance"
          description="Choose the visual mode that makes fieldwork and analysis comfortable to use."
        >
          <div className="settings-theme-options">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.id}
                  onClick={() => setTheme(option.id)}
                  variant={theme === option.id ? 'primary' : 'secondary'}
                >
                  <Icon size={15} />
                  {option.label}
                </Button>
              );
            })}
          </div>
          <p className="body-copy body-copy--small">
            Active mode:{' '}
            <strong>
              {resolvedTheme === 'dark' ? 'Pure black dark' : 'Light precision'}
            </strong>
            .
          </p>
        </Card>

        {isDevelopmentWorkspace ? (
          <Card
            title="Development workspace data"
            description="Refresh the current fixture workspace when working locally. Production deployments require an authenticated repository."
            actions={<Badge tone="neutral">{repositorySource.label}</Badge>}
          >
            <div className="record-stack">
              <p className="body-copy">
                {dataset
                  ? `${dataset.clients.length} clients and ${dataset.engagements.length} accessible engagements are loaded.`
                  : 'No workspace data is currently loaded.'}
              </p>
              <div>
                <Button
                  disabled={isLoading}
                  onClick={refreshWorkspace}
                  variant="secondary"
                >
                  <RefreshCw size={15} />
                  {isLoading ? 'Refreshing...' : 'Refresh fixture data'}
                </Button>
              </div>
            </div>
          </Card>
        ) : null}
      </section>

      <Card
        title="Internal configuration"
        description="Methodology templates, output templates, AI provider settings, and system configuration remain controlled internal capabilities. They are intentionally not part of the everyday engagement workflow."
      >
        <p className="body-copy">
          The active workspace provides contextual guidance and safe controls
          without exposing a workflow engine or permission matrix to the
          consultant doing the work.
        </p>
      </Card>
    </>
  );
}
