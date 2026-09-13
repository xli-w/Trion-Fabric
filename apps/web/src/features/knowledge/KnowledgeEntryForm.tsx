import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

import {
  evidenceTypes,
  frictionCategories,
  knowledgeAreaTags,
  knowledgeEntryTypes,
  knowledgeIndustryTags,
  knowledgeProcessTags,
  knowledgeSources,
  knowledgeSystemTags,
  opportunityTypes,
  transformationStages,
  type KnowledgeEntry,
  type KnowledgeTags,
} from '@domain';
import { Button } from '@ui';

import { useFabricData } from '@app/features/fabric-data/FabricDataContext';

function labelise(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function emptyTags(): KnowledgeTags {
  return {
    areas: [],
    processes: [],
    systems: [],
    issueCategories: [],
    evidenceTypes: [],
    opportunityTypes: [],
    industries: [],
    reviewStatuses: [],
  };
}

function initialTags(tags?: KnowledgeTags): KnowledgeTags {
  if (!tags) {
    return emptyTags();
  }

  return {
    areas: [...tags.areas],
    processes: [...tags.processes],
    systems: [...tags.systems],
    issueCategories: [...tags.issueCategories],
    evidenceTypes: [...tags.evidenceTypes],
    opportunityTypes: [...tags.opportunityTypes],
    industries: [...tags.industries],
    confidence: tags.confidence,
    reviewStatuses: [...tags.reviewStatuses],
  };
}

function selectValue<T extends string>(
  value: string,
  options: readonly T[],
  fallback: T,
) {
  return options.find((option) => option === value) ?? fallback;
}

function Field({
  label,
  children,
  detail,
}: {
  label: string;
  children: ReactNode;
  detail?: string;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
      {detail ? <small>{detail}</small> : null}
    </label>
  );
}

function MultiSelect<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T[];
  onChange: (value: T[]) => void;
}) {
  return (
    <Field label={label} detail="Use Ctrl or Cmd to select more than one.">
      <select
        className="knowledge-form__multi-select"
        multiple
        onChange={(event) => {
          const selected = new Set(
            Array.from(
              event.currentTarget.selectedOptions,
              (option) => option.value,
            ),
          );
          onChange(options.filter((option) => selected.has(option)));
        }}
        size={Math.min(options.length, 5)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labelise(option)}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function KnowledgeEntryForm({
  entry,
  onSaved,
}: {
  entry?: KnowledgeEntry;
  onSaved?: (entry: KnowledgeEntry) => void;
}) {
  const { createKnowledgeEntry, updateKnowledgeEntry } = useFabricData();
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState(entry?.type ?? 'diagnostic-prompt');
  const [title, setTitle] = useState(entry?.title ?? '');
  const [summary, setSummary] = useState(entry?.summary ?? '');
  const [content, setContent] = useState(entry?.content ?? '');
  const [source, setSource] = useState(entry?.source ?? 'trion-methodology');
  const [methodologyStage, setMethodologyStage] = useState<
    KnowledgeEntry['methodologyStage'] | ''
  >(entry?.methodologyStage ?? '');
  const [tags, setTags] = useState<KnowledgeTags>(() =>
    initialTags(entry?.tags),
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const requestedStatus =
      submitter instanceof HTMLButtonElement ? submitter.value : 'draft';
    const commonInput = {
      type,
      title: title.trim(),
      summary: summary.trim(),
      content: content.trim(),
      source,
      tags,
      methodologyStage: methodologyStage || undefined,
    };

    try {
      if (entry) {
        const saved = await updateKnowledgeEntry({
          ...entry,
          ...commonInput,
          status:
            requestedStatus === 'internal-review' ? 'internal-review' : 'draft',
        });
        onSaved?.(saved);
      } else {
        const saved = await createKnowledgeEntry(commonInput);
        onSaved?.(saved);
      }
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Reusable knowledge could not be saved.',
      );
    }
  }

  return (
    <form className="entity-form knowledge-form" onSubmit={submit}>
      <div className="form-grid">
        <Field label="Knowledge type">
          <select
            onChange={(event) => {
              const nextType = selectValue(
                event.target.value,
                knowledgeEntryTypes,
                'diagnostic-prompt',
              );
              setType(nextType);
              if (nextType === 'anonymised-example') {
                setSource('anonymised-client-learning');
              }
            }}
            value={type}
          >
            {knowledgeEntryTypes.map((option) => (
              <option key={option} value={option}>
                {labelise(option)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Knowledge source">
          <select
            disabled={type === 'anonymised-example'}
            onChange={(event) =>
              setSource(
                selectValue(
                  event.target.value,
                  knowledgeSources,
                  'trion-methodology',
                ),
              )
            }
            value={source}
          >
            {knowledgeSources.map((option) => (
              <option key={option} value={option}>
                {labelise(option)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Methodology stage">
          <select
            onChange={(event) =>
              setMethodologyStage(
                event.target.value
                  ? selectValue(
                      event.target.value,
                      transformationStages,
                      'discover',
                    )
                  : '',
              )
            }
            value={methodologyStage}
          >
            <option value="">Not stage-specific</option>
            {transformationStages.map((option) => (
              <option key={option} value={option}>
                {labelise(option)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Confidence">
          <select
            onChange={(event) =>
              setTags((current) => ({
                ...current,
                confidence: event.target.value
                  ? selectValue(
                      event.target.value,
                      ['low', 'medium', 'high'] as const,
                      'medium',
                    )
                  : undefined,
              }))
            }
            value={tags.confidence ?? ''}
          >
            <option value="">Not rated</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </Field>
      </div>

      <Field label="Title">
        <input
          onChange={(event) => setTitle(event.target.value)}
          required
          value={title}
        />
      </Field>
      <Field label="Short reusable summary">
        <textarea
          onChange={(event) => setSummary(event.target.value)}
          required
          rows={3}
          value={summary}
        />
      </Field>
      <Field
        label="Internal guidance or learning"
        detail="Do not include client names, confidential figures, or raw engagement notes."
      >
        <textarea
          onChange={(event) => setContent(event.target.value)}
          required
          rows={7}
          value={content}
        />
      </Field>

      <div className="knowledge-form__taxonomy">
        <MultiSelect
          label="Area"
          onChange={(areas) => setTags((current) => ({ ...current, areas }))}
          options={knowledgeAreaTags}
          value={tags.areas}
        />
        <MultiSelect
          label="Process"
          onChange={(processes) =>
            setTags((current) => ({ ...current, processes }))
          }
          options={knowledgeProcessTags}
          value={tags.processes}
        />
        <MultiSelect
          label="System"
          onChange={(systems) =>
            setTags((current) => ({ ...current, systems }))
          }
          options={knowledgeSystemTags}
          value={tags.systems}
        />
        <MultiSelect
          label="Issue category"
          onChange={(issueCategories) =>
            setTags((current) => ({ ...current, issueCategories }))
          }
          options={frictionCategories}
          value={tags.issueCategories}
        />
        <MultiSelect
          label="Evidence type"
          onChange={(evidenceTypes: KnowledgeTags['evidenceTypes']) =>
            setTags((current) => ({ ...current, evidenceTypes }))
          }
          options={evidenceTypes}
          value={tags.evidenceTypes}
        />
        <MultiSelect
          label="Opportunity type"
          onChange={(opportunityTypes: KnowledgeTags['opportunityTypes']) =>
            setTags((current) => ({ ...current, opportunityTypes }))
          }
          options={opportunityTypes}
          value={tags.opportunityTypes}
        />
        <MultiSelect
          label="Industry"
          onChange={(industries) =>
            setTags((current) => ({ ...current, industries }))
          }
          options={knowledgeIndustryTags}
          value={tags.industries}
        />
      </div>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="knowledge-form__actions">
        <Button type="submit" value="draft">
          {entry?.status === 'approved'
            ? 'Save revision as draft'
            : entry?.status === 'retired'
              ? 'Restore as draft'
              : 'Save internal draft'}
        </Button>
        {entry?.status === 'draft' ? (
          <Button type="submit" value="internal-review" variant="secondary">
            Submit for internal review
          </Button>
        ) : null}
      </div>
    </form>
  );
}
