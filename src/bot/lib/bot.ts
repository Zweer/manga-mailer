import type { Logger } from '@aws-lambda-powertools/logger';
import type { ConversationFlavor } from '@grammyjs/conversations';
import type { Context } from 'grammy';

import {
  conversations,
} from '@grammyjs/conversations';
import { Bot as BotConstructor } from 'grammy';

import { getTelegramToken } from '../utils';
import { createHelpMessage } from './commands/help';
import { createSignupConversation } from './commands/signup';
import { createTrackConversation } from './commands/track';
import { DynamoDBStorageAdapter } from './dynamodbStorageAdapter';

export type Bot = BotConstructor<ConversationFlavor<Context>>;

export async function createBot(logger: Logger) {
  const token = await getTelegramToken();
  const bot = new BotConstructor<ConversationFlavor<Context>>(token);
  bot.use(conversations({
    storage: new DynamoDBStorageAdapter(logger),
  }));

  createSignupConversation(bot, logger);
  createTrackConversation(bot, logger);
  createHelpMessage(bot, logger);

  bot.on('message', async (ctx) => {
    logger.info('Received message', { receivedMessage: ctx.message }, { ctx });
    await ctx.reply('❗️ I don\'t understand... tap /help to see the list of commands that you can use.');
  });

  return bot;
}
