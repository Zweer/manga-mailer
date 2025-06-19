import type { ConversationFlavor } from '@grammyjs/conversations';
import type { Context } from 'grammy';

import { Logger } from '@aws-lambda-powertools/logger';
import { conversations } from '@grammyjs/conversations';
import { Bot as BotConstructor } from 'grammy';

import { retrieveToken } from '../utils.js';

type BotContext = ConversationFlavor<Context>;
const Bot = BotConstructor<BotContext>;
export type BotType = BotConstructor<BotContext>;

const logger = new Logger();

export async function createBot(init = true): Promise<BotType> {
  const token = await retrieveToken();
  const bot = new Bot(token);

  if (init) {
    bot.use(conversations());
  }

  bot.on('message', async (ctx) => {
    logger.debug('Unknown message', { originalMsg: ctx.message });
    await ctx.reply('❗️ I don\'t understand... tap /help to see the list of commands that you can use.');
  });

  return bot;
}
