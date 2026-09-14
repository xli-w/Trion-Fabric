import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ExternalLink, FilterX } from 'lucide-react';

import {
  Badge,
  Button,
  Card,
  DataTable,
  FilterSelect,
  PageHeader,
  SearchInput,
  Sheet,
  StatCard,
  Toolbar,
  ToolbarGroup,
} from '@ui';
import { ActiveEngagementDataView } from '@app/features/fabric-data/ActiveEngagementDataView';
import { useFabricData } from '@app/features/fabric-data/FabricDataContext';
import {
  buildEvidenceLibrary,
  type EvidenceLibraryFilters,
} from '@app/features/fabric-data/selectors';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function reviewTone(status: string) {
  if (status === 'verified' || status === 'approved') {
    return 'success' as const;
  }
  if (status === 'rejected') {
    return 'danger' as const;
  }
  return 'warning' as const;
}

function visibilityTone(visibility: string) {
  if (visibility === 'approved-client-facing') {
    return 'success' as const;
  }
  if (visibility === 'archived') {
    return 'neutral' as const;
  }
  return 'accent' as const;
}

export function EvidenceLibraryPage() {
  const { activeEngagement, currentUser } = useFabricData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(
    searchParams.get('evidence'),
  );
  const [query, setQuery] = useState('');
  const [clientId, setClientId] = useState('');
  const [siteId, setSiteId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [processId, setProcessId] = useState('');
  const [systemId, setSystemId] = useState('');
  const [evidenceType, setEvidenceType] = useState('');
  const [source, setSource] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  const [visibility, setVisibility] = useState('');
  const [capturedDate, setCapturedDate] = useState('');
  const [recordedByUserId, setRecordedByUserId] = useState('');

  useEffect(() => {
    setSelectedEvidenceId(searchParams.get('evidence'));
  }, [searchParams]);

  function clearFilters() {
    setQuery('');
    setClientId('');
    setSiteId('');
    setAreaId('');
    setProcessId('');
    setSystemId('');
    setEvidenceType('');
    setSource('');
    setReviewStatus('');
    setVisibility('');
    setCapturedDate('');
    setRecordedByUserId('');
  }

  function selectEvidence(evidenceId: string) {
    setSelectedEvidenceId(evidenceId);
    setSearchParams({ evidence: evidenceId });
  }

  return (
    <ActiveEngagementDataView
      emptyTitle="Evidence library cannot be loaded"
      loadingDescription="Loading traceable fieldwork evidence and connected transformation records."
      loadingTitle="Loading evidence library"
    >
      {(dataset) => {
        if (!currentUser) {
          return null;
        }

        const engagementId = activeEngagement?.id ?? dataset.engagements[0]?.id;
        const filters: EvidenceLibraryFilters = {
          query: query || undefined,
          clientId: clientId || undefined,
          siteId: siteId || undefined,
          engagementId,
          areaId: areaId || undefined,
          processId: processId || undefined,
          systemId: systemId || undefined,
          evidenceType: evidenceType || undefined,
          source: source || undefined,
          reviewStatus: reviewStatus || undefined,
          visibility:
            visibility === 'internal' ||
            visibility === 'draft-client-facing' ||
            visibility === 'approved-client-facing' ||
            visibility === 'archived'
              ? visibility
              : undefined,
          capturedDate: capturedDate || undefined,
          recordedByUserId: recordedByUserId || undefined,
        };
        const library = buildEvidenceLibrary(dataset, currentUser, filters);
        const selectedEvidence = selectedEvidenceId
          ? library.allAccessibleRows.find(
              (evidence) => evidence.id === selectedEvidenceId,
            )
          : undefined;
        const hasFilters = [
          query,
          clientId,
          siteId,
          areaId,
          processId,
          systemId,
          evidenceType,
          source,
          reviewStatus,
          visibility,
          capturedDate,
          recordedByUserId,
        ].some(Boolean);

        return (
          <>
            <PageHeader
              eyebrow="Understand"
              title="Contextual evidence"
              description="Search this engagement's fieldwork evidence, retain its provenance, and follow every record into the observation, finding, opportunity, roadmap, or output it supports."
              metadata={[
                'Permission-filtered',
                'Traceable source links',
                'Internal working material',
              ]}
              actions={
                <Link className="table-link" to="/site-walks">
                  Capture through site walks <ExternalLink size={14} />
                </Link>
              }
            />

            <section className="metric-grid metric-grid--compact">
              <StatCard
                detail="Evidence available in the active engagement."
                label="Accessible evidence"
                tone="accent"
                value={String(library.metrics.total)}
              />
              <StatCard
                detail="Evidence currently matching the library filters."
                label="Visible records"
                tone="neutral"
                value={String(library.metrics.visible)}
              />
              <StatCard
                detail="Records that still need a verified review."
                label="Needs review"
                tone="warning"
                value={String(library.metrics.needsReview)}
              />
              <StatCard
                detail="Connected observations, findings, opportunities, initiatives, and outputs in view."
                label="Trace links"
                tone="success"
                value={String(library.metrics.linkedRecords)}
              />
            </section>

            <Toolbar className="evidence-library__toolbar">
              <ToolbarGroup>
                <SearchInput
                  onChange={setQuery}
                  placeholder="Try “paper production tracking” or “quality data delay”..."
                  value={query}
                />
                <FilterSelect
                  allLabel="All clients"
                  label="Client"
                  onChange={setClientId}
                  options={library.filterOptions.clients}
                  value={clientId}
                />
                <FilterSelect
                  allLabel="All sites"
                  label="Site"
                  onChange={setSiteId}
                  options={library.filterOptions.sites}
                  value={siteId}
                />
                <FilterSelect
                  allLabel="All evidence types"
                  label="Type"
                  onChange={setEvidenceType}
                  options={library.filterOptions.evidenceTypes}
                  value={evidenceType}
                />
                {hasFilters ? (
                  <Button onClick={clearFilters} variant="ghost">
                    <FilterX size={14} /> Clear
                  </Button>
                ) : null}
              </ToolbarGroup>
              <details className="evidence-library__advanced-filters">
                <summary>More filters</summary>
                <div className="evidence-library__advanced-filter-grid">
                  <FilterSelect
                    allLabel="All areas"
                    label="Area"
                    onChange={setAreaId}
                    options={library.filterOptions.areas}
                    value={areaId}
                  />
                  <FilterSelect
                    allLabel="All processes"
                    label="Process"
                    onChange={setProcessId}
                    options={library.filterOptions.processes}
                    value={processId}
                  />
                  <FilterSelect
                    allLabel="All systems"
                    label="System"
                    onChange={setSystemId}
                    options={library.filterOptions.systems}
                    value={systemId}
                  />
                  <FilterSelect
                    allLabel="All sources"
                    label="Source"
                    onChange={setSource}
                    options={library.filterOptions.sources}
                    value={source}
                  />
                  <FilterSelect
                    allLabel="All review states"
                    label="Review"
                    onChange={setReviewStatus}
                    options={library.filterOptions.reviewStatuses}
                    value={reviewStatus}
                  />
                  <FilterSelect
                    allLabel="All visibility"
                    label="Visibility"
                    onChange={setVisibility}
                    options={library.filterOptions.visibilities}
                    value={visibility}
                  />
                  <FilterSelect
                    allLabel="All recorders"
                    label="Recorded by"
                    onChange={setRecordedByUserId}
                    options={library.filterOptions.recordedBy}
                    value={recordedByUserId}
                  />
                  <label className="evidence-library__date-filter">
                    <span>Date captured</span>
                    <input
                      onChange={(event) => setCapturedDate(event.target.value)}
                      type="date"
                      value={capturedDate}
                    />
                  </label>
                </div>
              </details>
            </Toolbar>

            <Card
              title="Evidence register"
              description="Select an item to inspect its provenance and navigate its connected records."
            >
              <DataTable
                columns={[
                  {
                    header: 'Evidence',
                    key: 'evidence',
                    render: (row) => (
                      <div>
                        <strong>{row.title}</strong>
                        <p className="body-copy body-copy--small">
                          {row.summary}
                        </p>
                      </div>
                    ),
                    width: '28%',
                  },
                  {
                    header: 'Context',
                    render: (row) => (
                      <div className="evidence-library__context">
                        <strong>{row.engagementName}</strong>
                        <span>
                          {[
                            ...row.siteNames,
                            ...row.areaNames,
                            ...row.processNames,
                          ]
                            .filter(Boolean)
                            .join(' · ') || 'Engagement-scoped'}
                        </span>
                      </div>
                    ),
                    width: '24%',
                  },
                  {
                    header: 'Classification',
                    render: (row) => (
                      <div className="evidence-library__context">
                        <span>{row.evidenceType}</span>
                        <span>{row.source}</span>
                      </div>
                    ),
                  },
                  {
                    header: 'Review',
                    render: (row) => (
                      <Badge tone={reviewTone(row.reviewStatus)}>
                        {row.reviewStatus}
                      </Badge>
                    ),
                  },
                  {
                    header: 'Visibility',
                    render: (row) => (
                      <Badge tone={visibilityTone(row.visibility)}>
                        {row.visibility.replace(/-/g, ' ')}
                      </Badge>
                    ),
                  },
                  {
                    header: 'Captured',
                    render: (row) => (
                      <div className="evidence-library__context">
                        <span>{formatDate(row.capturedAt)}</span>
                        <span>
                          {row.recordedByNames.join(', ') || 'Unknown'}
                        </span>
                      </div>
                    ),
                  },
                  {
                    header: 'Links',
                    align: 'center',
                    render: (row) => row.links.length,
                  },
                ]}
                emptyState="No accessible evidence matches these filters."
                getRowKey={(row) => row.id}
                onRowClick={(row) => selectEvidence(row.id)}
                rows={library.rows}
                selectedRowKey={selectedEvidence?.id}
              />
            </Card>

            <Sheet
              description={
                selectedEvidence
                  ? `${selectedEvidence.engagementName} · ${selectedEvidence.clientName}`
                  : undefined
              }
              eyebrow="Traceable evidence"
              onOpenChange={(open) => {
                if (!open) {
                  setSelectedEvidenceId(null);
                  setSearchParams({});
                }
              }}
              open={Boolean(selectedEvidence)}
              size="lg"
              title={selectedEvidence?.title}
            >
              {selectedEvidence ? (
                <div className="evidence-inspector">
                  <div className="detail-badges">
                    <Badge tone="accent">{selectedEvidence.evidenceType}</Badge>
                    <Badge tone={reviewTone(selectedEvidence.reviewStatus)}>
                      {selectedEvidence.reviewStatus}
                    </Badge>
                    <Badge tone={visibilityTone(selectedEvidence.visibility)}>
                      {selectedEvidence.visibility.replace(/-/g, ' ')}
                    </Badge>
                  </div>

                  <section>
                    <h3>Captured record</h3>
                    <p className="body-copy">
                      {selectedEvidence.description ?? selectedEvidence.summary}
                    </p>
                    <dl className="detail-list">
                      <dt>Captured</dt>
                      <dd>{formatDate(selectedEvidence.capturedAt)}</dd>
                      <dt>Source</dt>
                      <dd>{selectedEvidence.source}</dd>
                      <dt>Recorded by</dt>
                      <dd>
                        {selectedEvidence.recordedByNames.join(', ') ||
                          'Unknown'}
                      </dd>
                      <dt>File reference</dt>
                      <dd>
                        {selectedEvidence.fileReference ?? 'Not recorded'}
                      </dd>
                      <dt>Systems</dt>
                      <dd>
                        {selectedEvidence.systemNames.join(', ') ||
                          'Not mapped'}
                      </dd>
                    </dl>
                  </section>

                  <section>
                    <h3>Connected records</h3>
                    <p className="body-copy body-copy--small">
                      These are traceability links, not automatically approved
                      conclusions.
                    </p>
                    <div className="evidence-trace-list">
                      {selectedEvidence.links.length > 0 ? (
                        selectedEvidence.links.map((link) => (
                          <Link
                            className="evidence-trace-link"
                            key={`${link.type}-${link.id}`}
                            to={link.path}
                          >
                            <span>
                              <strong>{link.label}</strong>
                              <small>{link.type}</small>
                            </span>
                            <ExternalLink size={15} />
                          </Link>
                        ))
                      ) : (
                        <div className="ui-table-empty">
                          No connected observation, finding, opportunity,
                          initiative, or output is recorded yet.
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              ) : null}
            </Sheet>
          </>
        );
      }}
    </ActiveEngagementDataView>
  );
}
