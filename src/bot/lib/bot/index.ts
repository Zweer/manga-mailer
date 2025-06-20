import type { ConversationFlavor } from '@grammyjs/conversations';
import type { Context } from 'grammy';

import { conversations } from '@grammyjs/conversations';
import { Bot as BotConstructor } from 'grammy';

import { logger } from '../../utils.js';
import { retrieveToken } from '../utils.js';
import { handleHelpCommand } from './command/help.js';
import { DynamoDBAdapter } from './storage.js';

type BotContext = ConversationFlavor<Context>;
const Bot = BotConstructor<BotContext>;
export type BotType = BotConstructor<BotContext>;

export async function createBot(init = true): Promise<BotType> {
  const token = await retrieveToken();
  const bot = new Bot(token);

  if (init) {
    bot.use(conversations({
      storage: {
        type: 'key',
        version: 0,
        adapter: new DynamoDBAdapter(),
      },
    }));

    handleHelpCommand(bot);
  }

  bot.on('message', async (ctx) => {
    logger.debug('Unknown message', { originalMsg: ctx.message });
    await ctx.reply('❗️ I don\'t understand... tap /help to see the list of commands that you can use.');
  });

  return bot;
}
