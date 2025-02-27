import type { RouteHandlerMethod } from 'fastify';

export const handleStatus: RouteHandlerMethod = async (request, reply) => {
  reply.code(200).send({
    status: 'OK',
  });
  return;
};
