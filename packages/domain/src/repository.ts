import type { FabricDataset, RepositorySource } from './model';

export interface FabricRepository {
  readonly source: RepositorySource;
  getDataset(): Promise<FabricDataset>;
  saveDataset(dataset: FabricDataset): Promise<void>;
}