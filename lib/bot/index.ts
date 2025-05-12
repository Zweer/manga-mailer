import type { ConversationFlavor } from '@grammyjs/conversations';
import type { Context } from 'grammy';

import {
  conversations,
} from '@grammyjs/conversations';
import { Bot as BotConstructor } from 'grammy';

import { createHelpMessage } from './commands/help';
import { createSignupConversation } from './commands/signup';
import { createTrackConversation } from './commands/track';

declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      TELEGRAM_TOKEN: string;
    }
  }
}

export type Bot = BotConstructor<ConversationFlavor<Context>>;

export async function createBot() {
  const bot = new BotConstructor<ConversationFlavor<Context>>(process.env.TELEGRAM_TOKEN);
  bot.use(conversations());

  createSignupConversation(bot);
  createTrackConversation(bot);
  createHelpMessage(bot);

  bot.on('message', async (ctx) => {
    console.log('Received message', ctx.message);
    await ctx.reply('❗️ I don\'t understand... tap /help to see the list of commands that you can use.');
  });

  return bot;
}
