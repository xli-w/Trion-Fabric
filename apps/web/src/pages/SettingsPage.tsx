import { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  PageHeader,
  StatCard,
  useTheme,
  type ThemeMode,
} from '@ui';
import { useFabricData } from '@app/features/fabric-data/FabricDataContext';
import {
  Sun,
  Moon,
  Laptop,
  Check,
  RefreshCw,
  Palette,
  Layers,
  Database,
  Cpu,
} from 'lucide-react';

export function SettingsPage() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { isLoading, refresh, repositorySource, dataset } = useFabricData();
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  const oppsCount = dataset?.opportunities.length ?? 0;
  const initiativesCount = dataset?.initiatives.length ?? 0;
  const clientsCount = dataset?.clients.length ?? 0;
  const sitesCount = dataset?.sites.length ?? 0;
  const walksCount = dataset?.siteWalks.length ?? 0;

  const themeOptions: {
    id: ThemeMode;
    label: string;
    description: string;
    icon: typeof Sun;
    previewClass: string;
  }[] = [
    {
      id: 'dark',
      label: 'Pure Black Dark Mode',
      description:
        'Pure black canvas (#000000) with dark Trion purple accent (#8b5cf6) and crisp white/grey typography.',
      icon: Moon,
      previewClass: 'theme-preview--dark',
    },
    {
      id: 'light',
      label: 'Light Precision',
      description:
        'High-clarity light canvas (#edf0f3) with Trion pine accent (#1d7f73) and subtle slate borders.',
      icon: Sun,
      previewClass: 'theme-preview--light',
    },
    {
      id: 'system',
      label: 'System Preference',
      description:
        'Automatically synchronises with your operating system color scheme.',
      icon: Laptop,
      previewClass: 'theme-preview--system',
    },
  ];

  const paletteColors = useMemo(() => {
    if (resolvedTheme === 'dark') {
      return [
        { name: 'Pure Canvas', hex: '#000000', role: 'Main Background' },
        { name: 'Dark Surface', hex: '#0a0a0f', role: 'Card / Panel Surface' },
        { name: 'Surface Alt', hex: '#12121a', role: 'Elevated Surface' },
        { name: 'Trion Purple', hex: '#8b5cf6', role: 'Primary Brand Accent' },
        { name: 'Purple Glow', hex: '#7c3aed', role: 'Hover Accent' },
        { name: 'Emerald', hex: '#34d399', role: 'Success / Low Risk' },
        { name: 'Amber', hex: '#fbbf24', role: 'Warning / Review' },
        { name: 'Coral', hex: '#f87171', role: 'Danger / Critical' },
      ];
    }
    return [
      { name: 'Light Canvas', hex: '#edf0f3', role: 'Main Background' },
      { name: 'Pure White', hex: '#ffffff', role: 'Card / Panel Surface' },
      { name: 'Surface Alt', hex: '#f6f8fa', role: 'Elevated Surface' },
      { name: 'Trion Pine', hex: '#1d7f73', role: 'Primary Brand Accent' },
      { name: 'Pine Deep', hex: '#16695f', role: 'Hover Accent' },
      { name: 'Forest Green', hex: '#218a57', role: 'Success / Low Risk' },
      { name: 'Warm Ochre', hex: '#b17318', role: 'Warning / Review' },
      { name: 'Crimson', hex: '#ba4d4d', role: 'Danger / Critical' },
    ];
  }, [resolvedTheme]);

  const handleReset = () => {
    void refresh();
    setResetFeedback('Workspace data and fixtures reloaded successfully.');
    setTimeout(() => setResetFeedback(null), 3000);
  };

  return (
    <div className="settings-container">
      <PageHeader
        eyebrow="System & Preferences"
        title="Settings & Appearance"
        description="Customise the visual appearance, theme mode, design token palette, and local workspace data repositories."
        actions={
          <Badge tone="accent">
            Active: {resolvedTheme === 'dark' ? 'Pure Black' : 'Light Precision'}
          </Badge>
        }
      />

      {/* Theme Selection */}
      <section className="settings-card">
        <div className="settings-card-header">
          <div>
            <h3 className="settings-card-title">Theme & Color Appearance</h3>
            <p className="settings-card-desc">
              Select your preferred visual theme. Dark mode provides a pure black canvas with Trion purple accents.
            </p>
          </div>
          <Palette size={20} color="var(--fabric-accent)" />
        </div>

        <div className="theme-mode-grid">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                className={`theme-mode-card ${isActive ? 'is-active' : ''}`}
                onClick={() => setTheme(opt.id)}
              >
                <div className={`theme-mode-preview ${opt.previewClass}`}>
                  <div className="preview-topbar">
                    <div className="preview-dot" />
                    <span>Fabric</span>
                  </div>
                  <div className="preview-content">
                    <span className="preview-badge">Active</span>
                    <span className="preview-pill">Workbench</span>
                  </div>
                </div>

                <div className="theme-mode-info">
                  <div className="theme-mode-name">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Icon size={16} />
                      {opt.label}
                    </span>
                    {isActive && <Check size={16} color="var(--fabric-accent)" />}
                  </div>
                  <p className="theme-mode-desc">{opt.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Live Visual Token Preview */}
      <section className="settings-card">
        <div className="settings-card-header">
          <div>
            <h3 className="settings-card-title">Live Design Tokens & Components</h3>
            <p className="settings-card-desc">
              Visual preview of active typography, interactive controls, badges, and card elevations in{' '}
              <strong>{resolvedTheme === 'dark' ? 'Pure Black Dark Mode' : 'Light Precision Mode'}</strong>.
            </p>
          </div>
          <Layers size={20} color="var(--fabric-accent)" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <Card title="Interactive Controls" description="Primary, secondary, and ghost button states">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <Button variant="primary">Primary Action</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost Button</Button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              <Badge tone="accent">Accent</Badge>
              <Badge tone="success">Success</Badge>
              <Badge tone="warning">Warning</Badge>
              <Badge tone="danger">Danger</Badge>
              <Badge tone="neutral">Neutral</Badge>
            </div>
          </Card>

          <StatCard
            tone="accent"
            label="Live Accent Stat"
            value="£2.4M"
            detail="Annualised recurring value under active tracking"
            footer={
              <Badge tone="accent">Trion Purple Token Active</Badge>
            }
          />
        </div>
      </section>

      {/* Palette Color Reference */}
      <section className="settings-card">
        <div className="settings-card-header">
          <div>
            <h3 className="settings-card-title">Active Palette Tokens</h3>
            <p className="settings-card-desc">
              Design tokens currently bound to the CSS theme variables.
            </p>
          </div>
          <Palette size={20} color="var(--fabric-accent)" />
        </div>

        <div className="palette-chips">
          {paletteColors.map((color) => (
            <div key={color.name} className="palette-chip">
              <div
                className="palette-swatch"
                style={{ backgroundColor: color.hex }}
              />
              <div>
                <div className="palette-chip-label">{color.name}</div>
                <div className="palette-chip-hex">{color.hex} • {color.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Data & Repository Diagnostics */}
      <section className="settings-card">
        <div className="settings-card-header">
          <div>
            <h3 className="settings-card-title">Data Source & Workspace Diagnostics</h3>
            <p className="settings-card-desc">
              Repository backend status, record counts, and fixture reload controls.
            </p>
          </div>
          <Database size={20} color="var(--fabric-accent)" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div className="record-item--note">
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--fabric-text-soft)' }}>
              Repository Source
            </span>
            <h4 style={{ margin: '4px 0', fontSize: 16 }}>{repositorySource.label}</h4>
            <p className="body-copy--small">Kind: {repositorySource.kind} • Local In-Memory Storage</p>
          </div>

          <div className="record-item--note">
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--fabric-text-soft)' }}>
              Loaded Entities
            </span>
            <h4 style={{ margin: '4px 0', fontSize: 16 }}>
              {oppsCount} Opps • {initiativesCount} Initiatives
            </h4>
            <p className="body-copy--small">
              {clientsCount} Clients • {sitesCount} Sites • {walksCount} Walks
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingTop: 8 }}>
          <div>
            {resetFeedback ? (
              <span className="form-success">{resetFeedback}</span>
            ) : (
              <span className="body-copy--small">
                Reload all seed fixtures and reset local in-memory modifications.
              </span>
            )}
          </div>
          <Button
            variant="secondary"
            disabled={isLoading}
            onClick={handleReset}
          >
            <RefreshCw size={14} style={{ marginRight: 6 }} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Reloading...' : 'Reload Seed Fixtures'}
          </Button>
        </div>
      </section>

      {/* Engineering Metadata */}
      <section className="settings-card">
        <div className="settings-card-header">
          <div>
            <h3 className="settings-card-title">Platform Architecture</h3>
            <p className="settings-card-desc">
              Technology stack specifications and active capabilities.
            </p>
          </div>
          <Cpu size={20} color="var(--fabric-accent)" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <div className="record-item--note">
            <strong style={{ display: 'block', fontSize: 13 }}>UI Primitive Engine</strong>
            <span className="body-copy--small">Radix UI Primitives + Pure CSS Tokens</span>
          </div>
          <div className="record-item--note">
            <strong style={{ display: 'block', fontSize: 13 }}>Visual Workbenches</strong>
            <span className="body-copy--small">React Flow v12 + Recharts 2.x</span>
          </div>
          <div className="record-item--note">
            <strong style={{ display: 'block', fontSize: 13 }}>Table & Grid System</strong>
            <span className="body-copy--small">TanStack Table v8</span>
          </div>
          <div className="record-item--note">
            <strong style={{ display: 'block', fontSize: 13 }}>Theme Architecture</strong>
            <span className="body-copy--small">Pure Black (#000000) + Trion Purple Accent</span>
          </div>
        </div>
      </section>
    </div>
  );
}
