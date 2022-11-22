import fastify from 'fastify';
import { create } from 'ipfs-http-client';
import { loadJsonFile } from 'load-json-file';
import { helloWorld } from './hello-world.js';
import { showImage } from './image.js';
import { generateClockImage } from './lancer-wallflower-clock.js';
import { initializePkmn } from './pkmn.js';

import * as url from 'url';
import { join } from 'path';
const __dirname: string = url.fileURLToPath(new url.URL('.', import.meta.url));

const webhookRequestJsonSchema = await loadJsonFile(
  join(__dirname, './webhook-request.schema.json')
);

type PromiseResolveType<T> = T extends PromiseLike<infer R> ? R : never;

let ipfsClient: ReturnType<typeof create>;
let pkmn: PromiseResolveType<ReturnType<typeof initializePkmn>>;
const server = fastify({ logger: true });

const webhookOpts = {
  schema: {
    body: webhookRequestJsonSchema,
  },
};

server.post('/', helloWorld);

server.post('/pkmn', webhookOpts, (request) => pkmn(request.body as any));

server.post('/image', () => showImage(ipfsClient));

server.post('/lancer-wallflower-clock', webhookOpts, (request) =>
  generateClockImage(ipfsClient, request.body as any)
);

const start = async () => {
  try {
    ipfsClient = create({
      url: process.env.IPFS_API,
    });

    pkmn = await initializePkmn();

    const id = await ipfsClient.id();

    server.log.info({ id });

    await server.listen(3000, '0.0.0.0');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
