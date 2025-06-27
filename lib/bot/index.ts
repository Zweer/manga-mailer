import {
  conversations,
} from '@grammyjs/conversations';

import { Bot } from '@/lib/bot/types';
import { createLogger } from '@/lib/logger';

const logger = createLogger('bot');

declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      TELEGRAM_TOKEN: string;
    }
  }
}

export function createBot(doInit = true) {
  const token = process.env.NODE_ENV === 'test' ? 'test' : process.env.TELEGRAM_TOKEN;
  const bot = new Bot(token);

  if (doInit) {
    bot.use(conversations());
  }

  bot.on('message', async (ctx) => {
    logger.debug({ message: ctx.message }, 'Unknown message');
    await ctx.reply('❗️ I don\'t understand... tap /help to see the list of commands that you can use.');
  });

  return bot;
}
