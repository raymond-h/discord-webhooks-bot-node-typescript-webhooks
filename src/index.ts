import fastify from 'fastify';

const server = fastify({ logger: true });

server.get('/', async () => {
  return { hello: 'world' };
});

const start = async () => {
  try {
    await server.listen(3000, '0.0.0.0');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
