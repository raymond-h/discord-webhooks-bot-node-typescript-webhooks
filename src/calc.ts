import { WebhookRequest, WebhookResponse } from './interfaces';
import nerdamer from 'nerdamer-prime';

export async function calc(body: WebhookRequest): Promise<WebhookResponse> {
  const e = nerdamer(body.arguments).evaluate();

  return {
    message: '```\n' + e.text() + '\n```',
  };
}
