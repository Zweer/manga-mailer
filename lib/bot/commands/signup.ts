import type { Conversation } from '@grammyjs/conversations';
import type { Context } from 'grammy';

import type { BotType } from '@/lib/bot/types';

import { createConversation } from '@grammyjs/conversations';

import { signupConversationId } from '@/lib/bot/constants';
import { upsertUser } from '@/lib/db/action/user';
import { createChildLogger } from '@/lib/log';

const logger = createChildLogger('bot:command:signup');

export async function signupConversationLogic(conversation: Conversation, ctx: Context) {
  logger.debug('Entered signup conversation');
  await ctx.reply('Hi there! What is your name?');

  const ctxName = await conversation.waitFor('message:text');
  const telegramId = ctxName.from.id;
  const name = ctxName.message.text;
  logger.debug(`Received name: "${name}"`);
  const preEmailCheckpoint = conversation.checkpoint();
  await ctx.reply(`Welcome to Manga Mailer, ${name}!`);
  await ctx.reply(`Where do you want us to mail you updates?`);

  const ctxEmail = await conversation.waitFor('message:text');
  const email = ctxEmail.message.text;
  if (email === '/cancel') {
    return;
  }
  logger.debug(`Received email: "${email}"`);

  const newUser = {
    telegramId,
    name,
    email,
  };

  const result = await conversation.external(async () => upsertUser(newUser));

  if (result.success) {
    logger.debug({ telegramId, name, email }, 'User saved');
    await ctx.reply(`Perfect, we'll use "${email}" as email address!`);
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
    logger.debug({ userId: ctx.from?.id }, 'Received /start command');
    await ctx.conversation.enter(signupConversationId);
  });
}
