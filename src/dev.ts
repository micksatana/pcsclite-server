import { createServer, initializePcsc } from './external';

const server = createServer();

initializePcsc(server);

server.listen({ port: 3000, host: '0.0.0.0' });
