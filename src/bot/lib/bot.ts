import type { Logger } from '@aws-lambda-powertools/logger';
import type { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import type { Context } from 'grammy';

import {
  conversations,
  createConversation,
} from '@grammyjs/conversations';
import { userRepository } from '@zweer/manga-mailer-database';
import { search } from '@zweer/manga-mailer-manga';
import { Bot as BotConstructor, InlineKeyboard } from 'grammy';

import { getTelegramToken } from '../utils';
import { commands } from './constants';
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

function createSignupConversation(bot: Bot, logger: Logger) {
  async function signup(conversation: Conversation, ctx: Context) {
    logger.info('[signup] Entered signup conversation', { ctx });
    await ctx.reply('Hi there! What is your name?');

    const ctxName = await conversation.waitFor('message:text');
    const userId = ctxName.chat.id;
    const name = ctxName.message.text;
    logger.info('[signup] Received name', { ctx: ctxName });
    await ctx.reply(`Welcome to Manga Mailer, ${name}!`);
    await ctx.reply(`Where do you want us to mail you updates?`);

    const ctxEmail = await conversation.waitFor('message:text');
    const email = ctxEmail.message.text;
    logger.info('[signup] Received email', { ctx: ctxEmail });
    try {
      const response = await conversation.external(async () => userRepository.put({ userId, name, email }));

      await ctx.reply(`Perfect, we'll use "${email}" as email address!`);
      logger.info('[signup] Saved user', { userId, name, email, response });
    } catch (error) {
      logger.error('[signup] Error saving user', { error });
      await ctx.reply('❗️ Something went wrong, please try again later.');
    }
  }
  bot.use(createConversation(signup));

  bot.command('start', async (ctx) => {
    logger.info('[signup] Received start command', { ctx });
    await ctx.conversation.enter('signup');
  });
}

function createTrackConversation(bot: Bot, logger: Logger) {
  async function track(conversation: Conversation, ctx: Context) {
    logger.info('[track] Entered track conversation', { ctx });
    await ctx.reply('Hi there! What is the name of the manga you want to track?');

    const ctxName = await conversation.waitFor('message:text');
    const title = ctxName.message.text;
    logger.info('[track] Received name', { ctx: ctxName });
    const mangas = await conversation.external(async () => search(title));

    const buttons = mangas.map(manga =>
      [
        InlineKeyboard.text(
          `[${manga.connectorName}] ${manga.title} (${manga.chaptersCount})`,
          `${manga.connectorName}:${manga.id}`,
        ),
      ]);
    buttons.push([InlineKeyboard.text('❌ Cancel', '/cancel')]);
    await ctx.reply('Please select the manga you want to track:', {
      reply_markup: InlineKeyboard.from(buttons),
    });

    const ctxManga = await conversation.waitFor('message:text');
    const [connectorName, mangaId] = ctxManga.message.text.split(':');
    await ctx.reply(`Perfect, we'll track "${mangaId}" on "${connectorName}"!`);
  }
  bot.use(createConversation(track, {
    maxMillisecondsToWait: 5 * 60 * 1_000,
  }));

  bot.command('track', async (ctx) => {
    logger.info('[track] Received track command', { ctx });
    const user = await userRepository.get({ userId: ctx.chat.id });

    if (user.Item) {
      await ctx.conversation.enter('track');
    } else {
      await ctx.conversation.enter('signup');
    }
  });
}

function createHelpMessage(bot: Bot, logger: Logger) {
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
