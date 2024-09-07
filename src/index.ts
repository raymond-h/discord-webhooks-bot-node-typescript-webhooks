import fastify from 'fastify';
import { loadJsonFile } from 'load-json-file';
import { helloWorld } from './hello-world.js';
import { showImage } from './image.js';
import { generateClockImage } from './lancer-wallflower-clock.js';
import { initializePkmn } from './pkmn.js';

import * as url from 'url';
import { join } from 'path';
import { WebhookRequest, WebhookResponse } from './interfaces.js';
import { calc } from './calc.js';
const __dirname: string = url.fileURLToPath(new url.URL('.', import.meta.url));

const webhookRequestJsonSchema = await loadJsonFile(
  join(__dirname, '../webhook-request.schema.json')
);

type PromiseResolveType<T> = T extends PromiseLike<infer R> ? R : never;

let pkmn: PromiseResolveType<ReturnType<typeof initializePkmn>>;
const server = fastify({ logger: true });

const webhookOpts = {
  schema: {
    body: webhookRequestJsonSchema,
  },
};

const webhookHandler =
  (fn: (body: WebhookRequest) => Promise<WebhookResponse>) =>
  (request: { body: any }) =>
    fn(request.body as WebhookRequest);

server.get('/.commands', async () => ({
  nextFetchDate: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  commands: [
    { name: 'hello-world-ts', url: '/' },
    { name: 'pkmn', url: '/pkmn' },
    { name: 'frog-image', url: '/image' },
    { name: 'lancer-wallflower-clock', url: '/lancer-wallflower-clock' },
    { name: 'calc', url: '/calc' },
  ],
}));

server.post('/', helloWorld);

server.post('/pkmn', webhookOpts, (request) =>
  pkmn(request.body as WebhookRequest)
);

server.post('/image', () => showImage());

server.post('/lancer-wallflower-clock', webhookOpts, (request) =>
  generateClockImage(request.body as WebhookRequest)
);

server.post('/calc', webhookOpts, webhookHandler(calc));

const start = async () => {
  try {
    pkmn = await initializePkmn();

    await server.listen(3000, '0.0.0.0');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
