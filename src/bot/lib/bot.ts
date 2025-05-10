import type { Logger } from '@aws-lambda-powertools/logger';
import type { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import type { Context } from 'grammy';

import process from 'node:process';

import {
  conversations,
  createConversation,
} from '@grammyjs/conversations';
import { Bot as BotConstructor } from 'grammy';

import { getTelegramToken } from '../utils';
import { commands } from './constants';
import { DynamoDBStorageAdapter } from './dynamodbStorageAdapter';

export type Bot = BotConstructor<ConversationFlavor<Context>>;

export async function createBot(logger: Logger) {
  const token = await getTelegramToken();
  const bot = new BotConstructor<ConversationFlavor<Context>>(token);
  bot.use(conversations({
    storage: new DynamoDBStorageAdapter(
      process.env.SESSION_TABLE_NAME!,
      process.env.SESSION_KEY_NAME!,
      logger,
    ),
  }));

  createSignupConversation(bot, logger);
  await createHelpMessage(bot, logger);

  bot.on('message', async (ctx) => {
    logger.info('Received message', { receivedMessage: ctx.message }, { ctx });
    await ctx.reply('Hi there!');
  });

  return bot;
}

function createSignupConversation(bot: Bot, logger: Logger) {
  async function signup(conversation: Conversation, ctx: Context) {
    logger.info('[signup] Entered signup conversation', { ctx });
    await ctx.reply('Hi there! What is your name?');

    const ctxName = await conversation.waitFor('message:text');
    logger.info('[signup] Received name', { ctx: ctxName });
    await ctx.reply(`Welcome to Manga Mailer, ${ctxName.message.text}!`);
    await ctx.reply(`Where do you want us to mail you updates?`);

    const ctxEmail = await conversation.waitFor('message:text');
    logger.info('[signup] Received email', { ctx: ctxEmail });
    await ctx.reply(`Perfect, we'll use "${ctxEmail.message.text}" as email address!`);
  }
  bot.use(createConversation(signup));

  bot.command('start', async (ctx) => {
    logger.info('[signup] Received start command', { ctx });
    await ctx.conversation.enter('signup');
  });
}

async function createHelpMessage(bot: Bot, logger: Logger) {
  const commandDescriptions = commands.map(({ command, description }) => `• /${command} \\- ${description}`).join('\n');

  bot.command('help', async (ctx) => {
    logger.info('[help] Received help command', { ctx });
    await ctx.reply(
      `⚙️ *Commands*:

${commandDescriptions}`,
      { parse_mode: 'MarkdownV2' },
    );
  });
}
