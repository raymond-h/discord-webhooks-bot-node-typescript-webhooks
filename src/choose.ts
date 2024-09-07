import { WebhookRequest, WebhookResponse } from './interfaces';
import _ from 'lodash';
const { sample } = _;

export async function choose(body: WebhookRequest): Promise<WebhookResponse> {
  const options = body.arguments.trim().split(/\s+(?:or|\|)\s+/g);

  return {
    message: `I choose... ${sample(options)}`,
  };
}
