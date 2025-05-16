import type { Conversation } from '@grammyjs/conversations';
import type { Context } from 'grammy';

import type { BotType } from '@/lib/bot/types';

import { createConversation } from '@grammyjs/conversations';

import { signupConversationId } from '@/lib/bot/constants';
import { upsertUser } from '@/lib/db/action/user';
import { logger as originalLogger } from '@/lib/logger';

const logger = originalLogger.child({ name: 'bot:command:signup' });

export async function signupConversationLogic(conversation: Conversation, ctx: Context) {
  logger.debug('Entered signup conversation');
  await ctx.reply('Hi there! What is your name?');

  const ctxName = await conversation.waitFor('message:text');
  const telegramId = ctxName.chat.id;
  const name = ctxName.message.text;
  logger.debug('Received name:', name);
  const preEmailCheckpoint = conversation.checkpoint();
  await ctx.reply(`Welcome to Manga Mailer, ${name}!`);
  await ctx.reply(`Where do you want us to mail you updates?`);

  const ctxEmail = await conversation.waitFor('message:text');
  const email = ctxEmail.message.text;
  if (email === '/cancel') {
    return;
  }
  logger.debug('Received email:', email);

  const newUser = {
    telegramId,
    name,
    email,
  };

  const result = await conversation.external(async () => upsertUser(newUser));

  if (!result.success) {
    if (result.validationError) {
      logger.error('Validation error:', result.validationError);
      await ctx.reply(`❗️ Something went wrong:\n\n${result.validationError.map(({ field, error }) => `• ${field}: ${error}`).join('\n')}`);
      await conversation.rewind(preEmailCheckpoint);
    } else if (typeof result.databaseError === 'string') {
      logger.error('Database error:', result.databaseError);
      await ctx.reply('❗️ Something went wrong, please try again later');
    }
  } else {
    await ctx.reply(`Perfect, we'll use "${email}" as email address!`);
    logger.debug('Saved user:', telegramId, name, email);
  }
}

export function createSignupConversation(bot: BotType) {
  bot.use(createConversation(signupConversationLogic, {
    id: signupConversationId,
  }));

  bot.command('start', async (ctx) => {
    logger.debug('Received start command');
    await ctx.conversation.enter(signupConversationId);
  });
}
