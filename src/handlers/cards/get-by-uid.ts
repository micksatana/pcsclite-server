import type { FastifyRequest } from 'fastify';

import type { MemoryAdapter } from '../../adapters';

export const handleGetByUid = async (
  request: FastifyRequest<{ Params: { uid: string } }>,
  reply
) => {
  const data = request.server['adapters'].data as MemoryAdapter;

  reply.code(200).send(await data.get(request.params.uid));

  return;
};
