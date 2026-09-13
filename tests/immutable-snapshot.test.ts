import { describe, expect, it } from 'vitest';

import type { User } from '@domain';
import {
  createAuthorizationActor,
  createImmutableSnapshot,
} from '@app/features/fabric-data/immutable-snapshot';
import { fabricFixtures } from '@app/data/development/fabric-fixtures';

describe('immutable workspace snapshots', () => {
  it('keeps nested UI data separate from the source dataset', () => {
    const snapshot = createImmutableSnapshot(fabricFixtures);
    const snapshotUser = snapshot.users.find(
      (user) => user.id === 'user-daniel-ward',
    );
    const sourceUser = fabricFixtures.users.find(
      (user) => user.id === 'user-daniel-ward',
    );
    if (!snapshotUser || !sourceUser) {
      throw new Error('Expected the read-only fixture user.');
    }

    expect(snapshot).not.toBe(fabricFixtures);
    expect(snapshot.users).not.toBe(fabricFixtures.users);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.users)).toBe(true);
    expect(Object.isFrozen(snapshotUser)).toBe(true);
    expect(() => {
      snapshotUser.role = 'administrator';
    }).toThrow(TypeError);
    expect(sourceUser.role).toBe('read-only');
  });

  it('captures an authorization actor separately from mutable user data', () => {
    const source: Pick<User, 'id' | 'role'> = {
      id: 'user-read-only',
      role: 'read-only',
    };
    const actor = createAuthorizationActor(source);

    source.role = 'administrator';

    expect(actor).not.toBe(source);
    expect(Object.isFrozen(actor)).toBe(true);
    expect(actor.role).toBe('read-only');
  });
});
