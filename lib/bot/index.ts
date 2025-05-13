import type { ConversationFlavor } from '@grammyjs/conversations';
import type { Context } from 'grammy';

import {
  conversations,
} from '@grammyjs/conversations';
import { Bot as BotConstructor } from 'grammy';

import { createHelpMessage } from '@/lib/bot/commands/help';
import { createListConversation } from '@/lib/bot/commands/list';
import { createSignupConversation } from '@/lib/bot/commands/signup';
import { createTrackConversation } from '@/lib/bot/commands/track';

declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      TELEGRAM_TOKEN: string;
    }
  }
}

export type Bot = BotConstructor<ConversationFlavor<Context>>;

export function createBot(doInit = true) {
  const bot = new BotConstructor<ConversationFlavor<Context>>(process.env.TELEGRAM_TOKEN);

  if (doInit) {
    bot.use(conversations());

    createSignupConversation(bot);
    createTrackConversation(bot);
    createListConversation(bot);
    createHelpMessage(bot);
  }

  bot.on('message', async (ctx) => {
    console.log('Received message', ctx.message);
    await ctx.reply('❗️ I don\'t understand... tap /help to see the list of commands that you can use.');
  });

  return bot;
}
