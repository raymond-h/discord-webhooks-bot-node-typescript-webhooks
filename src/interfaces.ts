export type WebhookResponse = WebhookResponseEntry | WebhookResponseEntry[];

export interface WebhookResponseEntry {
  message: string;
  imageUrl?: string | string[];
}
