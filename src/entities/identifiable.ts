export type Identifiable<T> = Required<{
  /**
   * Hashed unique ID for a card; ie md5 of citizen ID
   * This will be used as a reference to retrieve a card from GET /cards/:uid
   */
  uid: string;
}> &
  Required<T>;
