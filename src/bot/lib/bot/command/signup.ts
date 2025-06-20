/*
import type { Conversation } from '@grammyjs/conversations';
import type { Context } from 'grammy';

import type { BotType } from '../index.js';

import { createConversation } from '@grammyjs/conversations';

import { logger } from '../../../utils.js';
import { signupConversationId } from '../constants.js';

export async function signupConversationLogic(conversation: Conversation, ctx: Context) {
  const userId = ctx.from!.id;
  logger.debug('Entered signup conversation', { userId });
  await ctx.reply('Hi there! What is your name?');

  const ctxName = await conversation.waitFor('message:text');
  const userName = ctxName.message.text;
  logger.debug(`Received name: "${userName}"`, { userId, userName });
  const preEmailCheckpoint = conversation.checkpoint();
  await ctx.reply(`Welcome to Manga Mailer, ${userName}!`);
  await ctx.reply(`Where do you want us to mail you updates?`);

  const ctxEmail = await conversation.waitFor('message:text');
  const userEmail = ctxEmail.message.text;
  if (userEmail === '/cancel') {
    return;
  }
  logger.debug(`Received email: "${userEmail}"`, { userId, userName, userEmail });

  const result = await conversation.external(async () => upsertUser(newUser));

  if (result.success) {
    logger.debug('User saved', { telegramId: userId, name: userName, email: userEmail });
    await ctx.reply(`Perfect, we'll use "${userEmail}" as email address!`);
  } else if (result.validationErrors) {
    logger.error({ errors: result.validationErrors }, 'Validation error');
    await ctx.reply(`❗️ Something went wrong:\n\n${result.validationErrors.map(({ field, error }) => `• ${field}: ${error}`).join('\n')}`);
    await conversation.rewind(preEmailCheckpoint);
  } else if (typeof result.databaseError === 'string') {
    logger.error({ errors: [result.databaseError] }, 'Database error');
    await ctx.reply('❗️ Something went wrong, please try again later');
  }
}

export function createSignupConversation(bot: BotType) {
  bot.use(createConversation(signupConversationLogic, {
    id: signupConversationId,
  }));

  bot.command('start', async (ctx) => {
    logger.debug('Received /start command', { userId: ctx.from!.id });
    await ctx.conversation.enter(signupConversationId);
  });
}
*/
