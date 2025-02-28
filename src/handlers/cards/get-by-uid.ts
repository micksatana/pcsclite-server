import type { FastifyRequest, RouteHandlerMethod } from 'fastify';

import type { MemoryAdapter } from '../../adapters';

export const handleGetByUid: RouteHandlerMethod = async (
  request: FastifyRequest<{ Params: { uid: string } }>,
  reply
) => {
  const data = request.server['adapters'].data as MemoryAdapter;

  reply.code(200).send(await data.get(request.params.uid));

  return;
};
