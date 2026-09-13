import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  DataTable,
  LandscapeCanvas,
  PageHeader,
  Sheet,
  StatCard,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toolbar,
  SearchInput,
  FilterSelect,
  ViewToggle,
} from '@ui';
import {
  Layers,
  Workflow,
  ArrowRight,
} from 'lucide-react';
import { FabricDataView } from '@app/features/fabric-data/FabricDataView';

export function LandscapePage() {
  const [viewMode, setViewMode] = useState<'canvas' | 'register'>('canvas');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  return (
    <FabricDataView
      emptyTitle="Landscape cannot be loaded"
      loadingDescription="Loading structured areas, processes, systems, and relationships."
      loadingTitle="Loading landscape"
    >
      {(dataset) => {
        const relationships = dataset.landscapeRelationships;
        const entities = dataset.landscapeEntities;

        // Enrich entities with area name if available
        const enrichedEntities = entities.map((entity) => {
          let areaName: string | undefined;
          if (entity.type === 'process' && entity.sourceEntityId) {
            const proc = dataset.processes.find((p) => p.id === entity.sourceEntityId);
            if (proc) {
              const area = dataset.areas.find((a) => a.id === proc.areaId);
              areaName = area?.name;
            }
          }
          return {
            id: entity.id,
            name: entity.name,
            description: entity.description,
            type: entity.type,
            ownerRole: entity.ownerRole,
            sourceEntityId: entity.sourceEntityId,
            areaName,
          };
        });

        const selectedEntity = enrichedEntities.find((e) => e.id === selectedEntityId);

        // Find incoming and outgoing relationships for selected entity
        const incomingRelationships = selectedEntity
          ? relationships.filter((r) => r.toEntityId === selectedEntity.id)
          : [];
        const outgoingRelationships = selectedEntity
          ? relationships.filter((r) => r.fromEntityId === selectedEntity.id)
          : [];

        const filteredEntities = enrichedEntities.filter((entity) => {
          const matchesType = typeFilter === 'all' || entity.type === typeFilter;
          const matchesSearch =
            !searchQuery ||
            entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (entity.description &&
              entity.description.toLowerCase().includes(searchQuery.toLowerCase()));
          return matchesType && matchesSearch;
        });

        return (
          <>
            <PageHeader
              eyebrow="Diagnosis"
              title="Digital landscape structure"
              description="A structured projection of areas, processes, systems, data, and information flow that informs evidence-led opportunities and delivery sequencing."
              metadata={[
                'Operational context',
                'Relationship-aware',
                'Visual canvas & register',
              ]}
            />

            <section className="metric-grid metric-grid--compact">
              <StatCard
                label="Areas"
                value={String(dataset.areas.length)}
                detail="Operational areas linked to sites."
                tone="accent"
              />
              <StatCard
                label="Processes"
                value={String(dataset.processes.length)}
                detail="Processes available for assessment."
                tone="success"
              />
              <StatCard
                label="Systems"
                value={String(dataset.systems.length)}
                detail="Known operational systems."
                tone="neutral"
              />
              <StatCard
                label="Relationships"
                value={String(relationships.length)}
                detail="Explicit information and process flows."
                tone="warning"
              />
            </section>

            {/* Workbench Toolbar */}
            <Toolbar>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Filter entities & systems..."
                />
                <FilterSelect
                  label="Type"
                  value={typeFilter}
                  onChange={setTypeFilter}
                  options={[
                    { value: 'all', label: 'All types' },
                    { value: 'area', label: 'Areas' },
                    { value: 'process', label: 'Processes' },
                    { value: 'system', label: 'Systems' },
                    { value: 'data-object', label: 'Data objects' },
                  ]}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ViewToggle
                  value={viewMode}
                  onChange={(v: string) => setViewMode(v as 'canvas' | 'register')}
                  options={[
                    { id: 'canvas', label: 'Visual canvas', icon: <Workflow size={14} /> },
                    { id: 'register', label: 'Register & tables', icon: <Layers size={14} /> },
                  ]}
                />
              </div>
            </Toolbar>

            {/* Main Content: Canvas or Register View */}
            {viewMode === 'canvas' ? (
              <Card
                title="Interactive systems & process flow map"
                description="Visual graph of physical zones, operational processes, software systems, and data dependencies. Drag to pan, scroll to zoom, click any node to inspect relationships."
              >
                <LandscapeCanvas
                  entities={enrichedEntities}
                  relationships={relationships}
                  selectedEntityId={selectedEntityId}
                  onSelectEntity={(entity) => setSelectedEntityId(entity.id)}
                  height={620}
                />
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <Card
                  title="Landscape entities"
                  description="Structured catalog of enterprise entities. Click any row to inspect incoming/outgoing connections."
                >
                  <DataTable
                    rows={filteredEntities}
                    getRowKey={(row) => row.id}
                    selectedRowKey={selectedEntityId ?? undefined}
                    onRowClick={(row) => setSelectedEntityId(row.id)}
                    columns={[
                      {
                        key: 'name',
                        header: 'Entity name',
                        render: (row) => (
                          <div>
                            <strong>{row.name}</strong>
                            {row.description && (
                              <div className="body-copy body-copy--small">
                                {row.description}
                              </div>
                            )}
                          </div>
                        ),
                      },
                      {
                        key: 'type',
                        header: 'Type',
                        render: (row) => (
                          <Badge
                            tone={
                              row.type === 'system'
                                ? 'accent'
                                : row.type === 'process'
                                ? 'warning'
                                : row.type === 'area'
                                ? 'success'
                                : 'neutral'
                            }
                          >
                            {row.type}
                          </Badge>
                        ),
                      },
                      {
                        key: 'owner',
                        header: 'Owner role',
                        render: (row) => row.ownerRole || '—',
                      },
                      {
                        key: 'area',
                        header: 'Area / scope',
                        render: (row) => row.areaName || '—',
                      },
                    ]}
                  />
                </Card>

                <Card
                  title="Relationships & information flows"
                  description="Explicit dependencies, data integrations, and operational handoffs between systems and processes."
                >
                  <DataTable
                    rows={relationships}
                    getRowKey={(row) => row.id}
                    columns={[
                      {
                        header: 'Source (from)',
                        render: (row) => (
                          <strong>
                            {entities.find((e) => e.id === row.fromEntityId)?.name ||
                              row.fromEntityId}
                          </strong>
                        ),
                      },
                      {
                        header: 'Relationship type',
                        render: (row) => <Badge tone="accent">{row.type}</Badge>,
                      },
                      {
                        header: 'Target (to)',
                        render: (row) => (
                          <strong>
                            {entities.find((e) => e.id === row.toEntityId)?.name ||
                              row.toEntityId}
                          </strong>
                        ),
                      },
                      {
                        header: 'Rationale',
                        render: (row) => row.rationale || 'No rationale recorded',
                      },
                      {
                        header: 'Evidence',
                        render: (row) => `${row.evidenceIds.length} references`,
                      },
                    ]}
                  />
                </Card>
              </div>
            )}

            {/* Entity Inspector Sheet */}
            <Sheet
              open={Boolean(selectedEntity)}
              onOpenChange={(open) => {
                if (!open) setSelectedEntityId(null);
              }}
              title={selectedEntity?.name || 'Entity inspector'}
              description={selectedEntity?.type ? `Type: ${selectedEntity.type}` : undefined}
              size="lg"
            >
              {selectedEntity && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <Tabs defaultValue="details" variant="underline">
                    <TabsList>
                      <TabsTrigger value="details">Details & scope</TabsTrigger>
                      <TabsTrigger
                        value="flows"
                        badge={String(incomingRelationships.length + outgoingRelationships.length)}
                      >
                        Information flows
                      </TabsTrigger>
                      <TabsTrigger value="relationships">Dependencies</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <span className="body-copy body-copy--small" style={{ fontWeight: 700 }}>
                            Description:
                          </span>
                          <p className="body-copy" style={{ marginTop: '4px' }}>
                            {selectedEntity.description || 'No detailed description provided.'}
                          </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div style={{ padding: '12px', background: 'var(--fabric-surface-alt)', borderRadius: '6px' }}>
                            <span className="body-copy body-copy--small" style={{ fontWeight: 700 }}>
                              Type:
                            </span>
                            <div style={{ marginTop: '4px' }}>
                              <Badge tone="accent">{selectedEntity.type}</Badge>
                            </div>
                          </div>

                          <div style={{ padding: '12px', background: 'var(--fabric-surface-alt)', borderRadius: '6px' }}>
                            <span className="body-copy body-copy--small" style={{ fontWeight: 700 }}>
                              Owner role:
                            </span>
                            <div style={{ marginTop: '4px', fontWeight: 600 }}>
                              {selectedEntity.ownerRole || 'Not assigned'}
                            </div>
                          </div>
                        </div>

                        {selectedEntity.areaName && (
                          <div style={{ padding: '12px', background: 'var(--fabric-surface-alt)', borderRadius: '6px' }}>
                            <span className="body-copy body-copy--small" style={{ fontWeight: 700 }}>
                              Operational area:
                            </span>
                            <div style={{ marginTop: '4px', fontWeight: 600 }}>
                              {selectedEntity.areaName}
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="flows">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <strong style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--fabric-text-soft)' }}>
                            Outgoing flows ({outgoingRelationships.length})
                          </strong>
                          {outgoingRelationships.length === 0 ? (
                            <p className="body-copy" style={{ marginTop: '6px', fontStyle: 'italic' }}>
                              No outgoing flows recorded.
                            </p>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                              {outgoingRelationships.map((r) => {
                                const target = entities.find((e) => e.id === r.toEntityId);
                                return (
                                  <div
                                    key={r.id}
                                    style={{
                                      padding: '10px 12px',
                                      borderRadius: '6px',
                                      border: '1px solid var(--fabric-border)',
                                      background: 'var(--fabric-surface-alt)',
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                      <Badge tone="accent">{r.type}</Badge>
                                      <ArrowRight size={14} />
                                      <strong>{target?.name || r.toEntityId}</strong>
                                    </div>
                                    {r.rationale && (
                                      <div className="body-copy body-copy--small">{r.rationale}</div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div style={{ marginTop: '12px' }}>
                          <strong style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--fabric-text-soft)' }}>
                            Incoming flows ({incomingRelationships.length})
                          </strong>
                          {incomingRelationships.length === 0 ? (
                            <p className="body-copy" style={{ marginTop: '6px', fontStyle: 'italic' }}>
                              No incoming flows recorded.
                            </p>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                              {incomingRelationships.map((r) => {
                                const src = entities.find((e) => e.id === r.fromEntityId);
                                return (
                                  <div
                                    key={r.id}
                                    style={{
                                      padding: '10px 12px',
                                      borderRadius: '6px',
                                      border: '1px solid var(--fabric-border)',
                                      background: 'var(--fabric-surface-alt)',
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                      <strong>{src?.name || r.fromEntityId}</strong>
                                      <ArrowRight size={14} />
                                      <Badge tone="accent">{r.type}</Badge>
                                    </div>
                                    {r.rationale && (
                                      <div className="body-copy body-copy--small">{r.rationale}</div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="relationships">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <p className="body-copy">
                          Traceability linkage connects this landscape node to observations, diagnostic dimensions, and delivery initiatives.
                        </p>
                        <div style={{ padding: '12px', borderRadius: '6px', background: 'var(--fabric-accent-soft)', color: 'var(--fabric-accent)' }}>
                          <strong>Source Reference:</strong> {selectedEntity.sourceEntityId || 'Structured Entity'}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                    <Button variant="secondary" onClick={() => setSelectedEntityId(null)}>
                      Close Inspector
                    </Button>
                  </div>
                </div>
              )}
            </Sheet>
          </>
        );
      }}
    </FabricDataView>
  );
}
