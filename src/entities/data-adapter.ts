import { Readable } from './readable';
import { Storable } from './storable';

export type DataAdapter<IdentifiableCard> = Readable<IdentifiableCard> &
  Storable<IdentifiableCard>;
