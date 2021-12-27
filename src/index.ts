import fastify from 'fastify';
import { create } from 'ipfs-http-client';
import { helloWorld } from './hello-world';

let ipfsClient: ReturnType<typeof create>;
const server = fastify({ logger: true });

server.post('/', helloWorld);

server.get('/ipfs-peer-id', async () => {
  const id = await ipfsClient.id();

  return { id: id.id };
});

const start = async () => {
  try {
    ipfsClient = create({
      url: process.env.IPFS_API,
    });

    const id = await ipfsClient.id();

    server.log.info({ id });

    await server.listen(3000, '0.0.0.0');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
