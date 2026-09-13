import type { FabricDataset, FabricRepository } from '@domain';
import { fabricDatasetSchema } from '@validation';

import { fabricFixtures } from './fabric-fixtures';

const validatedDataset = fabricDatasetSchema.parse(fabricFixtures);

function cloneDataset(dataset: FabricDataset): FabricDataset {
  return JSON.parse(JSON.stringify(dataset)) as FabricDataset;
}

export function createInMemoryFabricRepository(): FabricRepository {
  return {
    source: {
      kind: 'development-fixtures',
      label: 'Development fixtures',
    },
    async getDataset() {
      return cloneDataset(validatedDataset);
    },
  };
}