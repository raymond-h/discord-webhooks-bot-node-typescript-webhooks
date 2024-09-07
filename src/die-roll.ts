import { WebhookRequest, WebhookResponse } from './interfaces';

import * as rpgDiceRoller from '@dice-roller/rpg-dice-roller';

const rollDice = (diceStr: string) => {
  const roll = new rpgDiceRoller.DiceRoll(diceStr);

  return `${roll}`;
};

export async function dieRoll(body: WebhookRequest): Promise<WebhookResponse> {
  return {
    message:
      ':game_die: ' +
      body.arguments
        .split(/\s*(?:and|[,|])\s*/)
        .map(rollDice)
        .join(' :game_die: ') +
      ' :game_die:',
  };
}
