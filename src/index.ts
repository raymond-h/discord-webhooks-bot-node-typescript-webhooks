import fastify from 'fastify';
import { create } from 'ipfs-http-client';
import webhookRequestJsonSchema from './webhook-request.schema.json';
import { helloWorld } from './hello-world';
import { showImage } from './image';
import { generateClockImage } from './lancer-wallflower-clock';

let ipfsClient: ReturnType<typeof create>;
const server = fastify({ logger: true });

const webhookOpts = {
  schema: {
    body: webhookRequestJsonSchema,
  },
};

server.post('/', helloWorld);

server.post('/image', () => showImage(ipfsClient));

server.post('/lancer-wallflower-clock', webhookOpts, (request) =>
  generateClockImage(ipfsClient, request.body as any)
);

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
