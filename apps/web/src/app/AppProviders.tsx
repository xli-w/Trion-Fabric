import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';

import { FabricDataProvider } from '@app/features/fabric-data/FabricDataContext';
import { createInMemoryFabricRepository } from '@app/data/development/in-memory-fabric-repository';
import { ThemeProvider } from '@ui';
import { parseRuntimeConfiguration } from './runtime-config';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const configuration = parseRuntimeConfiguration({
    VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE,
    VITE_DATA_SOURCE: import.meta.env.VITE_DATA_SOURCE,
    VITE_RELEASE_STAGE: import.meta.env.VITE_RELEASE_STAGE,
  });
  const repository = useMemo(() => {
    if (configuration.dataSource !== 'development-fixtures') {
      throw new Error(
        'No authenticated API or database repository is configured for this Fabric deployment.',
      );
    }

    return createInMemoryFabricRepository();
  }, [configuration.dataSource]);

  useEffect(() => {
    document.title = configuration.appTitle;
  }, [configuration.appTitle]);

  return (
    <ThemeProvider defaultTheme="dark">
      <FabricDataProvider repository={repository}>
        {children}
      </FabricDataProvider>
    </ThemeProvider>
  );
}
