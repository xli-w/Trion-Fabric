import { useState } from 'react';
import type { ReactNode } from 'react';

import type {
  LandscapeEntityType,
  LandscapeRelationshipType,
  LandscapeView,
  ReviewStatus,
} from '@domain';
import {
  landscapeEntityTypes,
  landscapeRelationshipDefinitions,
  landscapeRelationshipTypes,
  landscapeViewLabels,
  landscapeViews,
} from '@domain';
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  FilterSelect,
  LandscapeCanvas,
  PageHeader,
  SearchInput,
  Sheet,
  StatCard,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toolbar,
  ViewToggle,
} from '@ui';
import {
  Database,
  Edit3,
  GitBranch,
  History,
  Layers,
  Lightbulb,
  Link2,
  Server,
  ShieldCheck,
  TriangleAlert,
  UsersRound,
  Workflow,
} from 'lucide-react';

import { ActiveEngagementDataView } from '@app/features/fabric-data/ActiveEngagementDataView';
import { useFabricData } from '@app/features/fabric-data/FabricDataContext';
import {
  buildLandscapeWorkbench,
  type LandscapeEntityView,
} from '@app/features/fabric-data/selectors';
import {
  LandscapeEntityForm,
  LandscapeRelationshipForm,
  LandscapeVersionForm,
} from '@app/features/landscape/LandscapeForms';

type LandscapeDisplayMode = 'canvas' | 'register';
type EditorMode =
  | 'create-entity'
  | 'edit-entity'
  | 'create-relationship'
  | 'edit-relationship'
  | 'capture-version'
  | null;

function labelise(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function reviewTone(reviewStatus: ReviewStatus) {
  if (reviewStatus === 'approved') {
    return 'success' as const;
  }
  if (reviewStatus === 'reviewed') {
    return 'accent' as const;
  }
  return 'neutral' as const;
}

function viewIcon(view: LandscapeView): ReactNode {
  if (view === 'systems') {
    return <Server size={14} />;
  }
  if (view === 'data-flow') {
    return <Database size={14} />;
  }
  if (view === 'people') {
    return <UsersRound size={14} />;
  }
  if (view === 'opportunities') {
    return <Lightbulb size={14} />;
  }
  return <Workflow size={14} />;
}

function viewForEntityType(type: LandscapeEntityType): LandscapeView {
  if (type === 'system' || type === 'machine') {
    return 'systems';
  }
  if (type === 'data-object' || type === 'handoff') {
    return 'data-flow';
  }
  if (type === 'role') {
    return 'people';
  }
  return 'process';
}

function linkedNames(
  ids: string[],
  records: Array<{
    id: string;
    name?: string;
    title?: string;
    summary?: string;
  }>,
) {
  return ids
    .map((id) => {
      const record = records.find((item) => item.id === id);
      return record?.name ?? record?.title ?? record?.summary ?? id;
    })
    .join(', ');
}

export function LandscapePage() {
  const { activeEngagement, canPerform } = useFabricData();
  const [activeView, setActiveView] = useState<LandscapeView>('process');
  const [displayMode, setDisplayMode] =
    useState<LandscapeDisplayMode>('canvas');
  const [searchQuery, setSearchQuery] = useState('');
  const [entityType, setEntityType] = useState<LandscapeEntityType | 'all'>(
    'all',
  );
  const [relationshipType, setRelationshipType] = useState<
    LandscapeRelationshipType | 'all'
  >('all');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [editingEntityId, setEditingEntityId] = useState<string | null>(null);
  const [editingRelationshipId, setEditingRelationshipId] = useState<
    string | null
  >(null);
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <ActiveEngagementDataView
      emptyTitle="Landscape cannot be loaded"
      loadingDescription="Loading structured areas, processes, systems, information flow, and version history."
      loadingTitle="Loading digital landscape"
    >
      {(dataset) => {
        const engagementId =
          activeEngagement?.id ?? dataset.engagements[0]?.id ?? '';
        const workbench = engagementId
          ? buildLandscapeWorkbench(dataset, engagementId, {
              view: activeView,
              query: searchQuery,
              entityType,
              relationshipType,
            })
          : undefined;

        if (!workbench) {
          return (
            <>
              <PageHeader
                eyebrow="Understand"
                title="Digital landscape"
                description="Start an engagement before recording a structured operational landscape."
              />
              <EmptyState
                title="No engagement available"
                description="Create an engagement, then capture its areas, processes, systems, data, people, and handoffs."
              />
            </>
          );
        }

        const canEdit = canPerform('diagnostic:write', workbench.engagement.id);
        const selectedEntity = workbench.entities.find(
          (entity) => entity.id === selectedEntityId,
        );
        const allSelectedRelationships = selectedEntity
          ? dataset.landscapeRelationships
              .filter(
                (relationship) =>
                  relationship.engagementId === workbench.engagement.id &&
                  (relationship.fromEntityId === selectedEntity.id ||
                    relationship.toEntityId === selectedEntity.id),
              )
              .map((relationship) => ({
                ...relationship,
                fromName:
                  dataset.landscapeEntities.find(
                    (entity) => entity.id === relationship.fromEntityId,
                  )?.name ?? relationship.fromEntityId,
                toName:
                  dataset.landscapeEntities.find(
                    (entity) => entity.id === relationship.toEntityId,
                  )?.name ?? relationship.toEntityId,
                typeLabel:
                  landscapeRelationshipDefinitions[relationship.type].label,
              }))
          : [];
        const editingEntity = editingEntityId
          ? dataset.landscapeEntities.find(
              (entity) => entity.id === editingEntityId,
            )
          : undefined;
        const editingRelationship = editingRelationshipId
          ? dataset.landscapeRelationships.find(
              (relationship) => relationship.id === editingRelationshipId,
            )
          : undefined;
        const editorTitle =
          editorMode === 'create-entity'
            ? 'Add landscape item'
            : editorMode === 'edit-entity'
              ? `Edit ${editingEntity?.name ?? 'landscape item'}`
              : editorMode === 'create-relationship'
                ? 'Record landscape relationship'
                : editorMode === 'edit-relationship'
                  ? 'Edit landscape relationship'
                  : 'Capture landscape version';
        const editorDescription =
          editorMode === 'capture-version'
            ? 'Create an immutable current-state snapshot before future changes.'
            : 'Record the current state with traceability, confidence, and an explicit verification state.';

        const closeEditor = () => {
          setEditorMode(null);
          setEditingEntityId(null);
          setEditingRelationshipId(null);
        };
        const openEntityEditor = (entity?: LandscapeEntityView) => {
          setMessage(null);
          setEditingEntityId(entity?.id ?? null);
          if (entity) {
            setSelectedEntityId(null);
          }
          setEditorMode(entity ? 'edit-entity' : 'create-entity');
        };
        const openRelationshipEditor = (relationshipId?: string) => {
          setMessage(null);
          setEditingRelationshipId(relationshipId ?? null);
          setEditorMode(
            relationshipId ? 'edit-relationship' : 'create-relationship',
          );
        };

        return (
          <>
            <PageHeader
              eyebrow="Understand"
              title="Digital Landscape"
              description="A living current-state model of areas, processes, people, systems, data, machines, and handoffs. Explore focused views of the same traceable structure."
              metadata={[
                workbench.clientName,
                `${workbench.metrics.totalEntities} items`,
                workbench.currentVersion
                  ? `Version ${workbench.currentVersion.version}`
                  : 'No snapshot yet',
              ]}
              actions={<Badge tone="accent">Active engagement</Badge>}
            />

            {message ? (
              <p className="form-success" role="status">
                {message}
              </p>
            ) : null}

            {!canEdit ? (
              <Card
                eyebrow="Read-only"
                title="Landscape editing is unavailable"
                description="This workbench can be reviewed, but structured landscape changes require permission for the active engagement."
              >
                <p className="body-copy">
                  Switch to a Trion user with workspace access to add
                  current-state items, relationships, or snapshots.
                </p>
              </Card>
            ) : null}

            <section className="metric-grid metric-grid--compact">
              <StatCard
                label="Landscape items"
                value={String(workbench.metrics.totalEntities)}
                detail="Areas, processes, systems, data, people, machines, and handoffs."
                tone="accent"
              />
              <StatCard
                label="Relationships"
                value={String(workbench.metrics.totalRelationships)}
                detail="Explicit process, responsibility, system, and information-flow links."
                tone="success"
              />
              <StatCard
                label="Review prompts"
                value={String(workbench.metrics.qualityPromptCount)}
                detail="Signals for a consultant to review, not automatic conclusions."
                tone="warning"
              />
              <StatCard
                label="Client-safe items"
                value={String(workbench.metrics.clientSafeItems)}
                detail="Approved landscape records eligible for controlled output."
                tone="neutral"
              />
            </section>

            <Toolbar>
              <div className="landscape-toolbar__filters">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search names, descriptions, owners, and relationships..."
                />
                <FilterSelect
                  label="Item type"
                  value={entityType}
                  onChange={(value) =>
                    setEntityType(value as LandscapeEntityType | 'all')
                  }
                  options={[
                    { value: 'all', label: 'All items' },
                    ...landscapeEntityTypes.map((type) => ({
                      value: type,
                      label: labelise(type),
                    })),
                  ]}
                />
                <FilterSelect
                  label="Relationship"
                  value={relationshipType}
                  onChange={(value) =>
                    setRelationshipType(
                      value as LandscapeRelationshipType | 'all',
                    )
                  }
                  options={[
                    { value: 'all', label: 'All relationships' },
                    ...landscapeRelationshipTypes.map((type) => ({
                      value: type,
                      label: landscapeRelationshipDefinitions[type].label,
                    })),
                  ]}
                />
              </div>
              <div className="landscape-toolbar__actions">
                <Button
                  variant="secondary"
                  disabled={!canEdit}
                  onClick={() => openRelationshipEditor()}
                >
                  <Link2 size={15} /> Record relationship
                </Button>
                <Button disabled={!canEdit} onClick={() => openEntityEditor()}>
                  <Layers size={15} /> Add landscape item
                </Button>
              </div>
            </Toolbar>

            <section className="landscape-view-controls">
              <ViewToggle
                value={activeView}
                onChange={(value) => {
                  setActiveView(value as LandscapeView);
                  setSelectedEntityId(null);
                }}
                options={landscapeViews.map((view) => ({
                  id: view,
                  label: landscapeViewLabels[view],
                  icon: viewIcon(view),
                }))}
              />
              <ViewToggle
                value={displayMode}
                onChange={(value) =>
                  setDisplayMode(value as LandscapeDisplayMode)
                }
                options={[
                  {
                    id: 'canvas',
                    label: 'Visual map',
                    icon: <GitBranch size={14} />,
                  },
                  {
                    id: 'register',
                    label: 'Structured register',
                    icon: <Layers size={14} />,
                  },
                ]}
              />
            </section>

            {displayMode === 'canvas' ? (
              <Card
                title={landscapeViewLabels[activeView]}
                description="Use the controls above to keep the map focused. Select any item to inspect its traceability and connected relationships."
              >
                {workbench.entities.length === 0 ? (
                  <EmptyState
                    title="No items match this view"
                    description="Adjust the view or filters, or add the first structured landscape item for this engagement."
                  />
                ) : (
                  <LandscapeCanvas
                    entities={workbench.entities}
                    relationships={workbench.relationships}
                    selectedEntityId={selectedEntityId}
                    onSelectEntity={(entity) => setSelectedEntityId(entity.id)}
                    height={720}
                  />
                )}
              </Card>
            ) : (
              <div className="landscape-register">
                <Card
                  title={`${landscapeViewLabels[activeView]} items`}
                  description="Each record retains confidence, verification status, internal working context, and links to evidence-led work."
                  actions={
                    <Button
                      variant="secondary"
                      disabled={!canEdit}
                      onClick={() => openEntityEditor()}
                    >
                      Add item
                    </Button>
                  }
                >
                  <DataTable
                    rows={workbench.entities}
                    getRowKey={(entity) => entity.id}
                    selectedRowKey={selectedEntityId ?? undefined}
                    onRowClick={(entity) => setSelectedEntityId(entity.id)}
                    emptyState="No landscape items match the current view and filters."
                    columns={[
                      {
                        key: 'item',
                        header: 'Item',
                        render: (entity) => (
                          <div>
                            <strong>{entity.name}</strong>
                            <div className="body-copy body-copy--small">
                              {entity.description}
                            </div>
                          </div>
                        ),
                      },
                      {
                        key: 'type',
                        header: 'Type',
                        render: (entity) => (
                          <Badge tone="accent">{labelise(entity.type)}</Badge>
                        ),
                      },
                      {
                        key: 'owner',
                        header: 'Owner / responsibility',
                        render: (entity) => entity.ownerLabel ?? 'Not recorded',
                      },
                      {
                        key: 'assurance',
                        header: 'Confidence & verification',
                        render: (entity) => (
                          <div className="landscape-table-badges">
                            <Badge tone="neutral">{entity.confidence}</Badge>
                            <Badge
                              tone={
                                entity.verificationStatus === 'confirmed'
                                  ? 'success'
                                  : 'warning'
                              }
                            >
                              {labelise(entity.verificationStatus)}
                            </Badge>
                          </div>
                        ),
                      },
                      {
                        key: 'links',
                        header: 'Links',
                        render: (entity) =>
                          `${entity.observationCount} observation${
                            entity.observationCount === 1 ? '' : 's'
                          }, ${entity.opportunityCount} opportunit${
                            entity.opportunityCount === 1 ? 'y' : 'ies'
                          }`,
                      },
                      {
                        key: 'edit',
                        header: '',
                        align: 'right',
                        render: (entity) => (
                          <Button
                            variant="ghost"
                            disabled={!canEdit}
                            onClick={(event) => {
                              event.stopPropagation();
                              openEntityEditor(entity);
                            }}
                          >
                            <Edit3 size={14} /> Edit
                          </Button>
                        ),
                      },
                    ]}
                  />
                </Card>

                <Card
                  title="Relationships and information transfer"
                  description="Flows remain explicitly linked to their source and target items, supporting readable views without a free-form diagram."
                  actions={
                    <Button
                      variant="secondary"
                      disabled={!canEdit}
                      onClick={() => openRelationshipEditor()}
                    >
                      <Link2 size={15} /> Add relationship
                    </Button>
                  }
                >
                  <DataTable
                    rows={workbench.relationships}
                    getRowKey={(relationship) => relationship.id}
                    emptyState="No relationships match the current view and filters."
                    columns={[
                      {
                        key: 'from',
                        header: 'From',
                        render: (relationship) => (
                          <strong>{relationship.fromName}</strong>
                        ),
                      },
                      {
                        key: 'relationship',
                        header: 'Relationship',
                        render: (relationship) => (
                          <div className="landscape-table-badges">
                            <Badge tone="accent">
                              {relationship.typeLabel}
                            </Badge>
                            {relationship.transferMode ? (
                              <Badge
                                tone={
                                  relationship.transferMode === 'manual'
                                    ? 'warning'
                                    : 'success'
                                }
                              >
                                {relationship.transferMode}
                              </Badge>
                            ) : null}
                            {relationship.duplicateDataEntry ? (
                              <Badge tone="warning">duplicate entry</Badge>
                            ) : null}
                          </div>
                        ),
                      },
                      {
                        key: 'to',
                        header: 'To',
                        render: (relationship) => (
                          <strong>{relationship.toName}</strong>
                        ),
                      },
                      {
                        key: 'review',
                        header: 'Review',
                        render: (relationship) => (
                          <Badge tone={reviewTone(relationship.reviewStatus)}>
                            {labelise(relationship.reviewStatus)}
                          </Badge>
                        ),
                      },
                      {
                        key: 'edit',
                        header: '',
                        align: 'right',
                        render: (relationship) => (
                          <Button
                            variant="ghost"
                            disabled={!canEdit}
                            onClick={() =>
                              openRelationshipEditor(relationship.id)
                            }
                          >
                            <Edit3 size={14} /> Edit
                          </Button>
                        ),
                      },
                    ]}
                  />
                </Card>
              </div>
            )}

            <div className="landscape-secondary-grid">
              <Card
                eyebrow="Review prompts"
                title="Landscape quality indicators"
                description="These signals identify missing context or uncertainty for consultant review. They do not assert a diagnosis or recommendation."
              >
                {workbench.qualityIndicators.length === 0 ? (
                  <p className="body-copy">
                    No quality prompts are currently triggered for this
                    engagement.
                  </p>
                ) : (
                  <ul className="landscape-quality-list">
                    {workbench.qualityIndicators.map((indicator) => (
                      <li key={indicator.id}>
                        <div>
                          <strong>
                            <TriangleAlert size={15} /> {indicator.title}
                          </strong>
                          <span>{indicator.detail}</span>
                        </div>
                        {indicator.entityId ? (
                          <Button
                            variant="ghost"
                            onClick={() => {
                              const entity = dataset.landscapeEntities.find(
                                (item) => item.id === indicator.entityId,
                              );
                              if (entity) {
                                setActiveView(viewForEntityType(entity.type));
                              }
                              setSearchQuery('');
                              setEntityType('all');
                              setRelationshipType('all');
                              setSelectedEntityId(indicator.entityId ?? null);
                              setDisplayMode('canvas');
                            }}
                          >
                            Inspect
                          </Button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card
                eyebrow="Controlled output foundation"
                title="Version and A3-ready landscape data"
                description="The snapshot holds the current-state hierarchy, labels, and legend. External output uses only approved client-facing items and relationships."
                actions={
                  <Button
                    variant="secondary"
                    disabled={!canEdit}
                    onClick={() => {
                      setMessage(null);
                      setEditorMode('capture-version');
                    }}
                  >
                    <History size={15} /> Capture version
                  </Button>
                }
              >
                {workbench.currentVersion ? (
                  <div className="landscape-version-summary">
                    <div>
                      <span>Current snapshot</span>
                      <strong>
                        {workbench.currentVersion.title} (v
                        {workbench.currentVersion.version})
                      </strong>
                    </div>
                    <div>
                      <span>Captured</span>
                      <strong>
                        {new Date(
                          workbench.currentVersion.capturedAt,
                        ).toLocaleDateString('en-GB')}
                      </strong>
                    </div>
                    <div>
                      <span>Snapshot coverage</span>
                      <strong>
                        {workbench.currentVersion.entities.length} items,{' '}
                        {workbench.currentVersion.relationships.length} links
                      </strong>
                    </div>
                  </div>
                ) : (
                  <p className="body-copy">
                    Capture a version before using this landscape as a
                    controlled current-state output foundation.
                  </p>
                )}
                {workbench.a3Projection ? (
                  <div className="landscape-output-foundation">
                    <div>
                      <ShieldCheck size={18} />
                      <div>
                        <strong>
                          {workbench.a3Projection.clientName} -{' '}
                          {workbench.a3Projection.siteName}
                        </strong>
                        <span>
                          {workbench.a3Projection.entities.length} approved
                          items, {workbench.a3Projection.relationships.length}{' '}
                          approved relationships, v
                          {workbench.a3Projection.version}
                        </span>
                      </div>
                    </div>
                    <p>
                      Internal notes, draft records, unapproved relationships,
                      and raw evidence references are excluded from this
                      projection.
                    </p>
                  </div>
                ) : null}
                {workbench.versions.length > 1 ? (
                  <p className="body-copy body-copy--small">
                    {
                      workbench.versions.filter(
                        (version) => version.status === 'superseded',
                      ).length
                    }{' '}
                    historical snapshot
                    {workbench.versions.filter(
                      (version) => version.status === 'superseded',
                    ).length === 1
                      ? ''
                      : 's'}{' '}
                    retained.
                  </p>
                ) : null}
              </Card>
            </div>

            <Sheet
              open={editorMode !== null}
              onOpenChange={(open) => {
                if (!open) {
                  closeEditor();
                }
              }}
              eyebrow="Digital landscape"
              title={editorTitle}
              description={editorDescription}
              size="xl"
            >
              {editorMode === 'create-entity' ||
              editorMode === 'edit-entity' ? (
                <LandscapeEntityForm
                  key={`${editorMode}-${editingEntity?.id ?? workbench.engagement.id}`}
                  dataset={dataset}
                  engagementId={workbench.engagement.id}
                  entity={editingEntity}
                  onSaved={(entity) => {
                    setSelectedEntityId(entity.id);
                    closeEditor();
                    setMessage('Landscape item saved.');
                  }}
                />
              ) : null}
              {editorMode === 'create-relationship' ||
              editorMode === 'edit-relationship' ? (
                <LandscapeRelationshipForm
                  key={`${editorMode}-${editingRelationship?.id ?? workbench.engagement.id}`}
                  dataset={dataset}
                  engagementId={workbench.engagement.id}
                  relationship={editingRelationship}
                  onSaved={() => {
                    closeEditor();
                    setMessage('Landscape relationship saved.');
                  }}
                />
              ) : null}
              {editorMode === 'capture-version' ? (
                <LandscapeVersionForm
                  key={`version-${workbench.engagement.id}`}
                  dataset={dataset}
                  engagementId={workbench.engagement.id}
                  onSaved={() => {
                    closeEditor();
                    setMessage(
                      'Landscape version captured. The previous current version is retained as historical.',
                    );
                  }}
                />
              ) : null}
            </Sheet>

            <Sheet
              open={Boolean(selectedEntity)}
              onOpenChange={(open) => {
                if (!open) {
                  setSelectedEntityId(null);
                }
              }}
              eyebrow="Landscape item"
              title={selectedEntity?.name ?? 'Landscape item'}
              description={
                selectedEntity
                  ? `${labelise(selectedEntity.type)} at ${selectedEntity.siteName}`
                  : undefined
              }
              size="lg"
            >
              {selectedEntity ? (
                <div className="landscape-inspector">
                  <div className="detail-badges">
                    <Badge tone="accent">{labelise(selectedEntity.type)}</Badge>
                    <Badge tone="neutral">
                      {selectedEntity.confidence} confidence
                    </Badge>
                    <Badge
                      tone={
                        selectedEntity.verificationStatus === 'confirmed'
                          ? 'success'
                          : 'warning'
                      }
                    >
                      {labelise(selectedEntity.verificationStatus)}
                    </Badge>
                    <Badge tone={reviewTone(selectedEntity.reviewStatus)}>
                      {labelise(selectedEntity.reviewStatus)}
                    </Badge>
                  </div>
                  <Tabs defaultValue="details" variant="underline">
                    <TabsList>
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger
                        value="links"
                        badge={String(
                          selectedEntity.observationCount +
                            selectedEntity.evidenceCount +
                            selectedEntity.frictionCount +
                            selectedEntity.opportunityCount,
                        )}
                      >
                        Traceability
                      </TabsTrigger>
                      <TabsTrigger
                        value="relationships"
                        badge={String(allSelectedRelationships.length)}
                      >
                        Relationships
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="details">
                      <dl className="detail-list">
                        <dt>Description</dt>
                        <dd>{selectedEntity.description}</dd>
                        <dt>Owner / responsibility</dt>
                        <dd>{selectedEntity.ownerLabel ?? 'Not recorded'}</dd>
                        <dt>Documented method</dt>
                        <dd>
                          {selectedEntity.documentedMethod ??
                            'No documented method recorded.'}
                        </dd>
                        <dt>Canonical source</dt>
                        <dd>
                          {selectedEntity.sourceEntityId ??
                            'Landscape-only record'}
                        </dd>
                        <dt>Visibility</dt>
                        <dd>{labelise(selectedEntity.visibility)}</dd>
                      </dl>
                    </TabsContent>
                    <TabsContent value="links">
                      <dl className="detail-list">
                        <dt>Observations</dt>
                        <dd>
                          {linkedNames(
                            selectedEntity.linkedObservationIds,
                            dataset.observations,
                          ) || 'None linked'}
                        </dd>
                        <dt>Evidence</dt>
                        <dd>
                          {linkedNames(
                            selectedEntity.linkedEvidenceIds,
                            dataset.evidence,
                          ) || 'None linked'}
                        </dd>
                        <dt>Friction items</dt>
                        <dd>
                          {linkedNames(
                            selectedEntity.linkedFrictionItemIds,
                            dataset.frictionItems.map((item) => ({
                              id: item.id,
                              summary: item.frictionPoint,
                            })),
                          ) || 'None linked'}
                        </dd>
                        <dt>Opportunities</dt>
                        <dd>
                          {linkedNames(
                            selectedEntity.linkedOpportunityIds,
                            dataset.opportunities,
                          ) || 'None linked'}
                        </dd>
                      </dl>
                    </TabsContent>
                    <TabsContent value="relationships">
                      {allSelectedRelationships.length === 0 ? (
                        <p className="body-copy">
                          No relationships are recorded for this item.
                        </p>
                      ) : (
                        <ul className="landscape-relationship-list">
                          {allSelectedRelationships.map((relationship) => (
                            <li key={relationship.id}>
                              <strong>
                                {relationship.fromName} -{' '}
                                {relationship.typeLabel} - {relationship.toName}
                              </strong>
                              <span>
                                {relationship.rationale ??
                                  'No rationale recorded.'}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </TabsContent>
                  </Tabs>
                  <div className="landscape-inspector__actions">
                    <Button
                      variant="secondary"
                      disabled={!canEdit}
                      onClick={() => openEntityEditor(selectedEntity)}
                    >
                      <Edit3 size={15} /> Edit item
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedEntityId(null)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              ) : null}
            </Sheet>
          </>
        );
      }}
    </ActiveEngagementDataView>
  );
}
