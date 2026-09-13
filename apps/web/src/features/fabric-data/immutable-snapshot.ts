import type { User } from '@domain';

export type AuthorizationActor = Pick<User, 'id' | 'role'>;

function cloneAndFreeze(value: unknown): unknown {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((item) => cloneAndFreeze(item)));
  }

  if (value && typeof value === 'object') {
    const snapshot: Record<string, unknown> = {};

    Object.entries(value).forEach(([key, nestedValue]) => {
      snapshot[key] = cloneAndFreeze(nestedValue);
    });

    return Object.freeze(snapshot);
  }

  return value;
}

export function createImmutableSnapshot<T>(value: T): T {
  // UI readers must not be able to mutate the state used for authorization.
  return cloneAndFreeze(value) as T;
}

export function createAuthorizationActor(
  user: AuthorizationActor,
): AuthorizationActor {
  return Object.freeze({
    id: user.id,
    role: user.role,
  });
}
