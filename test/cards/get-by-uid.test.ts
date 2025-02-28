import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import req from 'supertest';

import { createServer } from '../../src/external/server';
import { memoryAdapter, ThaiIdCard } from '../../src';

describe('GET /cards/:uid', () => {
  const server = createServer();
  const card1 = {
    uid: '1234567890123',
    citizenId: '1234567890123',
  } as ThaiIdCard;
  const card2 = {
    uid: '3210987654321',
    citizenId: '3210987654321',
  } as ThaiIdCard;

  beforeAll(async () => {
    memoryAdapter.set(card1);
    memoryAdapter.set(card2);

    await server.listen();
  });

  it('returns a correct card', async () => {
    const res = await req(server.server).get(`/cards/${card1.uid}`);

    expect(res.status).toEqual(200);
    expect(res.body).toEqual(card1);
  });

  afterAll(async () => {
    vi.restoreAllMocks();
    server.close();
  });
});
