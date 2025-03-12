import fastify, { FastifyInstance } from 'fastify';
import { memoryAdapter } from '../adapters';
import { handleGetByUid, handleLatestCards, handleStatus } from '../handlers';

export const registerAllRoutes = (server: FastifyInstance) => {
  server.get('/status', handleStatus);
  server.get('/cards/latest', handleLatestCards);
  server.get('/cards/:uid', handleGetByUid);
};

export const createServer = () => {
  const server = fastify({
    logger: process.env.NODE_ENV !== 'test',
  });
  const adapters = {
    data: memoryAdapter,
  };
  // Set default data adapter to MemoryAdapter
  server.decorate('adapters', adapters);

  server.register(registerAllRoutes);

  return server;
};
