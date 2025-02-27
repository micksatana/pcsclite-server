import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import req from 'supertest';

import { server } from '../src/external';

describe('GET /status', () => {
  beforeAll(async () => {
    await server.listen();
  });

  it('OK', async () => {
    const res = await req(server.server).get('/status');

    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('OK');
  });

  afterAll(async () => {
    server.close();
  });
});
