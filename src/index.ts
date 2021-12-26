import fastify from 'fastify';
import { helloWorld } from './hello-world';

const server = fastify({ logger: true });

server.post('/', helloWorld);

const start = async () => {
  try {
    await server.listen(3000, '0.0.0.0');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
