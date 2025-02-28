import fastify from 'fastify';
import { memoryAdapter } from '../adapters';
import { handleGetByUid, handleLatestCards, handleStatus } from '../handlers';

const createServer = () => {
  const server = fastify({
    logger: process.env.NODE_ENV !== 'test',
  });
  const adapters = {
    data: memoryAdapter,
  };
  // Set default data adapter to MemoryAdapter
  server.decorate('adapters', adapters);

  server.register((server) => {
    server.get('/status', handleStatus);
    server.get('/cards/latest', handleLatestCards);
    server.get('/cards/:uid', handleGetByUid);
  });

  return server;
};

export { createServer };
