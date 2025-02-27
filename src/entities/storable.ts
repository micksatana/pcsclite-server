export interface Storable<IdentifiableCard> {
  set: (card: IdentifiableCard) => Promise<void>;
}
