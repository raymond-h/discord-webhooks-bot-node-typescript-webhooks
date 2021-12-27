import fs from 'fs';
import { IPFSHTTPClient } from 'ipfs-http-client';
import { WebhookResponse } from './interfaces';

export async function showImage(
  ipfsClient: IPFSHTTPClient
): Promise<WebhookResponse> {
  const frogImage = fs.createReadStream('frog.png');

  const { cid } = await ipfsClient.add(frogImage);

  return {
    message: `Good evening; take this frog. https://${cid.toV1()}.ipfs.dweb.link`
  };
}
