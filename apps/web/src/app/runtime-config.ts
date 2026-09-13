export type RuntimeDataSource = 'development-fixtures' | 'api' | 'database';
export type RuntimeReleaseStage =
  | 'development'
  | 'test'
  | 'staging'
  | 'production';

export interface RuntimeConfiguration {
  appTitle: string;
  dataSource: RuntimeDataSource;
  releaseStage: RuntimeReleaseStage;
}

interface RuntimeEnvironment {
  VITE_APP_TITLE?: string;
  VITE_DATA_SOURCE?: string;
  VITE_RELEASE_STAGE?: string;
}

const supportedDataSources: RuntimeDataSource[] = [
  'development-fixtures',
  'api',
  'database',
];
const supportedReleaseStages: RuntimeReleaseStage[] = [
  'development',
  'test',
  'staging',
  'production',
];

function configuredValue(value: string | undefined) {
  return value?.trim();
}

function isRuntimeDataSource(value: string): value is RuntimeDataSource {
  return supportedDataSources.some((source) => source === value);
}

function isRuntimeReleaseStage(value: string): value is RuntimeReleaseStage {
  return supportedReleaseStages.some((stage) => stage === value);
}

export function parseRuntimeConfiguration(
  environment: RuntimeEnvironment,
): RuntimeConfiguration {
  const appTitle =
    configuredValue(environment.VITE_APP_TITLE) || 'Trion Fabric';
  const configuredDataSource =
    configuredValue(environment.VITE_DATA_SOURCE) ?? 'development-fixtures';
  const configuredReleaseStage =
    configuredValue(environment.VITE_RELEASE_STAGE) ?? 'development';

  if (!isRuntimeDataSource(configuredDataSource)) {
    throw new Error(
      'VITE_DATA_SOURCE must be development-fixtures, api, or database.',
    );
  }

  if (!isRuntimeReleaseStage(configuredReleaseStage)) {
    throw new Error(
      'VITE_RELEASE_STAGE must be development, test, staging, or production.',
    );
  }

  const dataSource = configuredDataSource;
  const releaseStage = configuredReleaseStage;

  if (releaseStage === 'production' && dataSource === 'development-fixtures') {
    throw new Error(
      'Production Fabric must use an authenticated API or database repository.',
    );
  }

  return {
    appTitle,
    dataSource,
    releaseStage,
  };
}
