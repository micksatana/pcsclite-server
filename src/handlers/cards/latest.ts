import type { RouteHandlerMethod } from 'fastify';

import type { MemoryAdapter } from '../../adapters';

export const handleLatestCards: RouteHandlerMethod = async (request, reply) => {
  const data = request.server['adapters'].data as MemoryAdapter;

  reply.code(200).send(await data.latest());

  return;
};
