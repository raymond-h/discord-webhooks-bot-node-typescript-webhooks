// import fs from 'fs';
import { WebhookResponse } from './interfaces';

export async function showImage(): Promise<WebhookResponse> {
  // TODO const frogImage = fs.createReadStream('frog.png');

  return {
    message: `Good evening; no frogs available as of this time.`,
  };
}
