import { DataAdapter } from '../entities/data-adapter';
import { ThaiIdCard } from '../entities/thai-id-card';

const _dict: {
  [uid: string]: ThaiIdCard;
} = {};
const _sequence: string[] = [];

export type MemoryAdapter = DataAdapter<ThaiIdCard>;

export const memoryAdapter: MemoryAdapter = {
  set: async (card) => {
    _dict[card.uid] = card;
    _sequence.push(card.uid);
  },
  get: async (uid: string) => {
    return _dict[uid];
  },
  latest: async () => {
    return _dict[_sequence[_sequence.length - 1]];
  },
};
