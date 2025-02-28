export interface Readable<IdentifiableCard> {
  get: (uid: string) => Promise<IdentifiableCard>;
  latest: () => Promise<IdentifiableCard | null>;
}
