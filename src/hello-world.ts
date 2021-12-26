import { WebhookResponse } from './interfaces';

export async function helloWorld(): Promise<WebhookResponse> {
  return {
    message: 'Hello world from Node and Typescript!',
    imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAI5JREFUOI3tkbEVwyAMRH8yiUqVLjWCR6DUCBmJkhE8AmVGYBOnCTw/g3Gfl6tU6O6+AP563C2IyF7nUkq3Pw0Qkd2SoaoAxCV2Ic+Z2d+OqhKXeFkyJKjmkc4UHcHMfEtQbwbIW8bW7xxy2zm/QReAg7+84aawAhDSNv+Faj62WrLWPjKPCY5yIF6bf0QfzAA80kMqr/gAAAAASUVORK5CYII='
  };
}
