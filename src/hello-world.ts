import { WebhookResponse } from './interfaces';

export async function helloWorld(): Promise<WebhookResponse> {
  return {
    message: 'Hello world from Node and Typescript!'
  };
}
