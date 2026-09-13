import { describe, expect, it } from 'vitest';

import { parseRuntimeConfiguration } from '@app/app/runtime-config';

describe('runtime configuration', () => {
  it('uses the safe development-fixture defaults for local work', () => {
    expect(parseRuntimeConfiguration({})).toEqual({
      appTitle: 'Trion Fabric',
      dataSource: 'development-fixtures',
      releaseStage: 'development',
    });
  });

  it('rejects an unsupported repository mode', () => {
    expect(() =>
      parseRuntimeConfiguration({
        VITE_DATA_SOURCE: 'browser-local-storage',
      }),
    ).toThrow('VITE_DATA_SOURCE');
  });

  it('does not permit the in-memory fixture repository in production', () => {
    expect(() =>
      parseRuntimeConfiguration({
        VITE_DATA_SOURCE: 'development-fixtures',
        VITE_RELEASE_STAGE: 'production',
      }),
    ).toThrow('Production Fabric');
  });

  it('allows a production configuration to request a durable repository', () => {
    expect(
      parseRuntimeConfiguration({
        VITE_APP_TITLE: 'Fabric staging',
        VITE_DATA_SOURCE: 'api',
        VITE_RELEASE_STAGE: 'staging',
      }),
    ).toEqual({
      appTitle: 'Fabric staging',
      dataSource: 'api',
      releaseStage: 'staging',
    });
  });
});
