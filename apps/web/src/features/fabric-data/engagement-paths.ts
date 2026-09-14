import type { EntityId } from '@domain';

export type OpportunitySourceType = 'evidence' | 'observation' | 'finding';

export interface OpportunitySourceReference {
  type: OpportunitySourceType;
  id: EntityId;
}

export function activeWorkspacePath(engagementId?: EntityId | null) {
  return engagementId ? `/workspace/${engagementId}` : '/workspace';
}

function splitPath(path: string) {
  const hashIndex = path.indexOf('#');
  const pathWithoutHash = hashIndex === -1 ? path : path.slice(0, hashIndex);
  const hash = hashIndex === -1 ? '' : path.slice(hashIndex);
  const searchIndex = pathWithoutHash.indexOf('?');

  return {
    pathname:
      searchIndex === -1
        ? pathWithoutHash
        : pathWithoutHash.slice(0, searchIndex),
    search: searchIndex === -1 ? '' : pathWithoutHash.slice(searchIndex + 1),
    hash,
  };
}

export function withEngagementContext(
  path: string,
  engagementId?: EntityId | null,
) {
  if (!engagementId) {
    return path;
  }

  const { hash, pathname, search } = splitPath(path);
  const searchParams = new URLSearchParams(search);
  searchParams.set('engagement', engagementId);

  return `${pathname}?${searchParams.toString()}${hash}`;
}

export function buildOpportunityCreationPath(
  engagementId: EntityId,
  source: OpportunitySourceReference,
) {
  const { hash, pathname, search } = splitPath(
    withEngagementContext('/opportunities', engagementId),
  );
  const searchParams = new URLSearchParams(search);
  searchParams.set('create', 'opportunity');
  searchParams.set('source', `${source.type}:${source.id}`);

  return `${pathname}?${searchParams.toString()}${hash}`;
}

export function parseOpportunitySourceReference(
  value: string | null,
): OpportunitySourceReference | undefined {
  if (!value) {
    return undefined;
  }

  const [type, id, ...rest] = value.split(':');
  if (
    rest.length > 0 ||
    !id ||
    (type !== 'evidence' && type !== 'observation' && type !== 'finding')
  ) {
    return undefined;
  }

  return { type, id };
}
