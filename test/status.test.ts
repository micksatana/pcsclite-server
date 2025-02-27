import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import req from 'supertest';

import { version } from '../package.json';
import { createServer } from '../src/external';

describe('GET /status', () => {
  const server = createServer();

  beforeAll(async () => {
    await server.listen();
  });

  it('OK', async () => {
    const res = await req(server.server).get('/status');

    expect(res.status).toEqual(200);
    expect(res.body.status).toEqual('OK');
    expect(res.body.version).toEqual(version);
  });

  afterAll(async () => {
    server.close();
  });
});
