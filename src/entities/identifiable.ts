export type Identifiable<T> = Record<string, string | number | ArrayBuffer> &
  Required<{ uid: string }> &
  Required<T>;
