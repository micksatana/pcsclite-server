import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import req from 'supertest';

import { server } from '../../src/external/server';
import { memoryAdapter, ThaiIdCard } from '../../src';

describe('GET /cards/latest', () => {
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
    const res = await req(server.server).get('/cards/latest');

    expect(res.status).toEqual(200);
    expect(res.body).toEqual(card2);
  });

  afterAll(async () => {
    vi.restoreAllMocks();
    server.close();
  });
});
