export type WebhookResponse = WebhookResponseEntry | WebhookResponseEntry[];

export interface WebhookResponseEntry {
  message: string;
  imageUrl?: string | string[];
}

export interface WebhookRequest {
  author: {
    id: string;
    username: string;
    name: string;
  };
  channel: {
    id: string;
    name: string;
    type: string;
  };
  guild: {
    id: string;
    name: string;
  } | null;
  command: string;
  arguments: string;
}

export type MinimalWebhookRequest = Pick<WebhookRequest, 'arguments'> &
  Partial<Omit<WebhookRequest, 'arguments'>>;
