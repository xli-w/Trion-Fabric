import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import type {
  EntityId,
  FabricDataset,
  Output,
  OutputSourceCandidate,
  OutputType,
} from '@domain';
import {
  getOutputSourceCatalog,
  getOutputTemplate,
  getRecommendedOutputSourceReferences,
  isOutputSourceSupportedByTemplate,
  outputTypes,
} from '@domain';
import { Button } from '@ui';
import type { CreateOutputInput } from '@app/features/fabric-data/FabricDataContext';

type DraftSource = OutputSourceCandidate & {
  isApplicable: boolean;
  isSelected: boolean;
};

interface OutputDraftEditorProps {
  output: Output;
  sources: DraftSource[];
  onCancel: () => void;
  onSave: (output: Output) => Promise<void>;
}

function sourceLabel(source: OutputSourceCandidate) {
  return `${source.title} (${source.type.replace(/-/g, ' ')})`;
}

export function OutputDraftEditor({
  output,
  sources,
  onCancel,
  onSave,
}: OutputDraftEditorProps) {
  const editableSections = getOutputTemplate(output.outputType).sections.filter(
    (section) => section.editable,
  );
  const [selectedSourceIds, setSelectedSourceIds] = useState<EntityId[]>([]);
  const [narratives, setNarratives] = useState<Record<string, string>>({});
  const [narrativeSourceIds, setNarrativeSourceIds] = useState<
    Record<string, EntityId[]>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedSourceIds(
      sources
        .filter(
          (source) =>
            source.isSelected && source.isClientSafe && source.isApplicable,
        )
        .map((source) => source.id),
    );
    setNarratives(
      Object.fromEntries(
        output.sectionOverrides.map((override) => [
          override.sectionId,
          override.narrative,
        ]),
      ),
    );
    setNarrativeSourceIds(
      Object.fromEntries(
        output.sectionOverrides.map((override) => [
          override.sectionId,
          override.sourceReferences,
        ]),
      ),
    );
    setError(null);
  }, [output, sources]);

  const safeSources = sources.filter(
    (source) => source.isClientSafe && source.isApplicable,
  );
  const excludedSources = sources.filter(
    (source) => source.isSelected && !source.isClientSafe,
  );

  function toggleSource(sourceId: EntityId) {
    if (selectedSourceIds.includes(sourceId)) {
      setNarrativeSourceIds((narrativesBySection) =>
        Object.fromEntries(
          Object.entries(narrativesBySection).map(([sectionId, sourceIds]) => [
            sectionId,
            sourceIds.filter((id) => id !== sourceId),
          ]),
        ),
      );
    }

    setSelectedSourceIds((current) =>
      current.includes(sourceId)
        ? current.filter((id) => id !== sourceId)
        : [...current, sourceId],
    );
  }

  function toggleNarrativeSource(sectionId: string, sourceId: EntityId) {
    setNarrativeSourceIds((current) => {
      const sourceIds = current[sectionId] ?? [];
      return {
        ...current,
        [sectionId]: sourceIds.includes(sourceId)
          ? sourceIds.filter((id) => id !== sourceId)
          : [...sourceIds, sourceId],
      };
    });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (selectedSourceIds.length === 0) {
      setError('Select at least one approved source before saving the draft.');
      return;
    }

    const sectionOverrides = editableSections
      .map((section) => ({
        sectionId: section.id,
        narrative: narratives[section.id]?.trim() ?? '',
        sourceReferences: (narrativeSourceIds[section.id] ?? []).filter(
          (sourceId) => selectedSourceIds.includes(sourceId),
        ),
      }))
      .filter((override) => override.narrative.length > 0);

    if (
      sectionOverrides.some(
        (override) => override.sourceReferences.length === 0,
      )
    ) {
      setError(
        'Select at least one approved report source for every editorial narrative.',
      );
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        ...output,
        sourceReferences: selectedSourceIds,
        sectionOverrides,
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'The output draft could not be saved.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="output-report-form" onSubmit={(event) => void save(event)}>
      <p className="body-copy">
        This is an internal draft workspace. Only approved source records and
        reviewed output content can be exported as a client-facing report.
      </p>

      <fieldset className="output-report-form__sources">
        <legend>Approved report sources</legend>
        <p className="body-copy body-copy--small">
          Select the structured records this report version should cite.
        </p>
        {safeSources.length === 0 ? (
          <p className="form-error">
            No approved sources are available for this report template yet.
          </p>
        ) : (
          <div className="output-report-form__source-list">
            {safeSources.map((source) => (
              <label key={source.id}>
                <input
                  checked={selectedSourceIds.includes(source.id)}
                  onChange={() => toggleSource(source.id)}
                  type="checkbox"
                />
                <span>{sourceLabel(source)}</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      {excludedSources.length > 0 ? (
        <section className="output-report-form__excluded">
          <strong>Selected sources to remove</strong>
          <p className="body-copy body-copy--small">
            These records are not approved for client-facing reporting and will
            be removed when the draft is saved.
          </p>
          <ul>
            {excludedSources.map((source) => (
              <li key={source.id}>
                {sourceLabel(source)}: {source.exclusionReason}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {editableSections.map((section) => {
        const narrative = narratives[section.id] ?? '';
        const supportingSources = safeSources.filter((source) =>
          selectedSourceIds.includes(source.id),
        );

        return (
          <fieldset className="output-report-form__narrative" key={section.id}>
            <legend>{section.title}</legend>
            <label>
              <span className="sr-only">{section.title} narrative</span>
              <textarea
                onChange={(event) =>
                  setNarratives((current) => ({
                    ...current,
                    [section.id]: event.target.value,
                  }))
                }
                placeholder="Add a concise client-ready narrative for this section..."
                rows={5}
                value={narrative}
              />
            </label>
            <div className="output-report-form__narrative-sources">
              <span>Sources supporting this editorial narrative</span>
              <p className="body-copy body-copy--small">
                Required when a narrative is added. Only selected approved
                report sources can be cited.
              </p>
              {supportingSources.length > 0 ? (
                <div className="output-report-form__source-list">
                  {supportingSources.map((source) => (
                    <label key={source.id}>
                      <input
                        checked={(
                          narrativeSourceIds[section.id] ?? []
                        ).includes(source.id)}
                        disabled={narrative.trim().length === 0}
                        onChange={() =>
                          toggleNarrativeSource(section.id, source.id)
                        }
                        type="checkbox"
                      />
                      <span>{sourceLabel(source)}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="form-error">
                  Select an approved report source before adding a narrative.
                </p>
              )}
            </div>
          </fieldset>
        );
      })}

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="output-report-form__actions">
        <Button disabled={isSaving} type="submit">
          {isSaving ? 'Saving draft...' : 'Save and regenerate draft'}
        </Button>
        <Button disabled={isSaving} onClick={onCancel} variant="ghost">
          Cancel
        </Button>
      </div>
    </form>
  );
}

interface CreateOutputFormProps {
  dataset: FabricDataset;
  engagements: Array<{ id: EntityId; name: string }>;
  onCancel: () => void;
  onCreate: (input: CreateOutputInput) => Promise<Output>;
  onCreated: (output: Output) => void;
}

export function CreateOutputForm({
  dataset,
  engagements,
  onCancel,
  onCreate,
  onCreated,
}: CreateOutputFormProps) {
  const [engagementId, setEngagementId] = useState(engagements[0]?.id ?? '');
  const [outputType, setOutputType] = useState<OutputType>('executive-summary');
  const [title, setTitle] = useState('');
  const [selectedSourceIds, setSelectedSourceIds] = useState<EntityId[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const engagement = engagements.find((item) => item.id === engagementId);
  const safeSources = useMemo(
    () =>
      engagementId
        ? getOutputSourceCatalog(dataset, engagementId).filter(
            (source) =>
              source.isClientSafe &&
              isOutputSourceSupportedByTemplate(outputType, source.type),
          )
        : [],
    [dataset, engagementId, outputType],
  );

  useEffect(() => {
    if (!engagement) {
      setTitle('');
      setSelectedSourceIds([]);
      return;
    }

    setTitle(`${engagement.name} ${getOutputTemplate(outputType).label}`);
    setSelectedSourceIds(
      getRecommendedOutputSourceReferences(dataset, engagement.id, outputType),
    );
    setError(null);
  }, [dataset, engagement, outputType]);

  function toggleSource(sourceId: EntityId) {
    setSelectedSourceIds((current) =>
      current.includes(sourceId)
        ? current.filter((id) => id !== sourceId)
        : [...current, sourceId],
    );
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!engagementId || !engagement) {
      setError('Select an engagement before creating an output.');
      return;
    }
    if (!title.trim()) {
      setError('Enter a report title.');
      return;
    }
    if (selectedSourceIds.length === 0) {
      setError('Select at least one approved source for this output.');
      return;
    }

    setIsSaving(true);
    try {
      const output = await onCreate({
        engagementId,
        outputType,
        title: title.trim(),
        sourceReferences: selectedSourceIds,
      });
      onCreated(output);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'The controlled output could not be created.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      className="output-report-form"
      onSubmit={(event) => void create(event)}
    >
      <label>
        <span>Engagement</span>
        <select
          onChange={(event) => setEngagementId(event.target.value)}
          value={engagementId}
        >
          {engagements.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Report template</span>
        <select
          onChange={(event) => setOutputType(event.target.value as OutputType)}
          value={outputType}
        >
          {outputTypes.map((type) => (
            <option key={type} value={type}>
              {getOutputTemplate(type).label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Report title</span>
        <input
          onChange={(event) => setTitle(event.target.value)}
          value={title}
        />
      </label>

      <fieldset className="output-report-form__sources">
        <legend>Approved report sources</legend>
        {safeSources.length === 0 ? (
          <p className="form-error">
            No approved source records are available for this template.
          </p>
        ) : (
          <div className="output-report-form__source-list">
            {safeSources.map((source) => (
              <label key={source.id}>
                <input
                  checked={selectedSourceIds.includes(source.id)}
                  onChange={() => toggleSource(source.id)}
                  type="checkbox"
                />
                <span>{sourceLabel(source)}</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="output-report-form__actions">
        <Button disabled={isSaving || engagements.length === 0} type="submit">
          {isSaving ? 'Creating report...' : 'Create internal draft'}
        </Button>
        <Button disabled={isSaving} onClick={onCancel} variant="ghost">
          Cancel
        </Button>
      </div>
    </form>
  );
}
