import type { Conversation } from '@grammyjs/conversations';
import type { Context } from 'grammy';

import type { BotType } from '@/lib/bot/types';
import type { User } from '@/lib/db/model';

import { createConversation } from '@grammyjs/conversations';
import { InlineKeyboard } from 'grammy';

import { startConversationId } from '@/lib/bot/constants.js';
import { createLogger } from '@/lib/logger';

const logger = createLogger('bot:help');

async function retrieveEmail(message): Promise<string> {

}

async function startConversationLogic(conversation: Conversation, ctx: Context, user?: User): Promise<void> {
  const userId = ctx.from!.id;
  logger.debug('Entered start conversation', { userId, user });
  let emailMessage: string;

  if (!user) {
    user = {
      telegramId: userId,
      name: '',
      email: '',
    };
    await ctx.reply('Hi there! What is your name?');

    const ctxName = await conversation.waitFor('message:text');
    user.name = ctxName.message.text;
    logger.debug(`Received name: "${user.name}"`, { user });
    await ctx.reply(`Welcome to Manga Mailer, ${user.name}!`);
    emailMessage = 'Where do you want us to mail you updates?';
  } else {
    emailMessage = `Hi ${user.name}! Do you want to change your email address? (${user.email})`;
  }

  const keyboard = new InlineKeyboard();
  const keyboardCancelValue = 'cancel';
  keyboard.text('❌ Cancel Operation', keyboardCancelValue).row();
  await ctx.reply(emailMessage, { reply_markup: keyboard });
  const emailCheckpoint = conversation.checkpoint();

  const answer = await conversation.waitFor(['message:text', 'callback_query:data']);
  if (answer.callbackQuery) {
    if (answer.callbackQuery.data !== keyboardCancelValue) {
      logger.warn('Received a strange callbackQuery:', answer.callbackQuery.data);
    }

    await ctx.reply('❌ Operation cancelled', { reply_markup: undefined });

    return;
  }

  user.email = answer.message.text;

  const result = await conversation.external(async () => upsertUser(user));

  if (result.success) {
    logger.debug('User updated', { telegramId: user.id, name: user.name, email: user.email });
    await ctx.reply(`Perfect, we'll use "${user.email}" as your new email address!`);
  } else if (result.validationErrors) {
    logger.error('Validation error', { errors: result.validationErrors });
    await ctx.reply(`❗️ Something went wrong:\n\n${result.validationErrors.map(({ field, error }) => `• ${field}: ${error}`).join('\n')}`);
    await conversation.rewind(emailCheckpoint);
  } else if (typeof result.databaseError === 'string') {
    logger.error('Database error', { errors: [result.databaseError] });
    await ctx.reply('❗️ Something went wrong, please try again later');
  }
}

export function handleStartCommand(bot: BotType) {
  bot.use(createConversation(startConversationLogic, {
    id: startConversationId,
  }));

  bot.command('start', async (ctx) => {
    const userId = ctx.from!.id;
    logger.debug('Received /start command', { userId });

    const user = await getUser(userId);
    await ctx.conversation.enter(startConversationId, user);
  });
}
