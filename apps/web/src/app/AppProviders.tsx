import type { ReactNode } from 'react';

import { FabricDataProvider } from '@app/features/fabric-data/FabricDataContext';
import { createInMemoryFabricRepository } from '@app/data/development/in-memory-fabric-repository';
import { ThemeProvider } from '@ui';

const repository = createInMemoryFabricRepository();

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme="dark">
      <FabricDataProvider repository={repository}>{children}</FabricDataProvider>
    </ThemeProvider>
  );
}