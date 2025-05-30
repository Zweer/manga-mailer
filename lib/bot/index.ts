import {
  conversations,
} from '@grammyjs/conversations';

import { createHelpMessage } from '@/lib/bot/commands/help';
import { createListConversation } from '@/lib/bot/commands/list';
import { createRemoveConversation } from '@/lib/bot/commands/remove';
import { createSignupConversation } from '@/lib/bot/commands/signup';
import { createTrackConversation } from '@/lib/bot/commands/track';
import { Bot } from '@/lib/bot/types';
import { createChildLogger } from '@/lib/log';

const logger = createChildLogger('bot');

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

    createSignupConversation(bot);
    createTrackConversation(bot);
    createListConversation(bot);
    createRemoveConversation(bot);
    createHelpMessage(bot);
  }

  bot.on('message', async (ctx) => {
    logger.debug({ message: ctx.message }, 'Unknown message');
    await ctx.reply('❗️ I don\'t understand... tap /help to see the list of commands that you can use.');
  });

  return bot;
}
