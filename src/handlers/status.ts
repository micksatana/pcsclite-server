import type { RouteHandlerMethod } from 'fastify';
import { version } from '../../package.json';

export const handleStatus: RouteHandlerMethod = async (request, reply) => {
  reply.code(200).send({
    status: 'OK',
    version,
  });
  return;
};
