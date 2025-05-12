import type { Logger } from '@aws-lambda-powertools/logger';
import type { Conversation } from '@grammyjs/conversations';
import type { Context } from 'grammy';

import type { Bot } from '../bot';

import { createConversation } from '@grammyjs/conversations';
import { userRepository } from '@zweer/manga-mailer-database';

export function createSignupConversation(bot: Bot, logger: Logger) {
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
