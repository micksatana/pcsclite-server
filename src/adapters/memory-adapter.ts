import { DataAdapter } from '../entities/data-adapter';
import { ThaiIdCard } from '../use-cases/thai-id-card';

const _dict: {
  [uid: string]: ThaiIdCard;
} = {};
const _sequence: Array<string|null> = [];

export type MemoryAdapter = DataAdapter<ThaiIdCard>;

export const memoryAdapter: MemoryAdapter = {
  set: async (card?) => {
    _sequence.filter(c => !!c);

    if (card) {
      _dict[card.uid] = card;
      _sequence.push(card.uid);
    } else {
      _sequence.push(null);
    }
  },
  get: async (uid: string) => {
    return _dict[uid];
  },
  latest: async () => {
    const latestUid = _sequence[_sequence.length - 1];
    return latestUid ? _dict[latestUid] : null;
  },
};
