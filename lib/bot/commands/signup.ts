import type { Conversation } from '@grammyjs/conversations';
import type { Context } from 'grammy';

import type { Bot } from '@/lib/bot';

import { createConversation } from '@grammyjs/conversations';

import { signupConversationId } from '@/lib/bot/constants';
import { upsertUser } from '@/lib/db/action/user';
import { userValidation } from '@/lib/validation/user';

export function createSignupConversation(bot: Bot) {
  async function signup(conversation: Conversation, ctx: Context) {
    console.log('[signup] Entered signup conversation');
    await ctx.reply('Hi there! What is your name?');

    const ctxName = await conversation.waitFor('message:text');
    const telegramId = ctxName.chat.id;
    const name = ctxName.message.text;
    console.log('[signup] Received name:', name);
    const preEmailCheckpoint = conversation.checkpoint();
    await ctx.reply(`Welcome to Manga Mailer, ${name}!`);
    await ctx.reply(`Where do you want us to mail you updates?`);

    const ctxEmail = await conversation.waitFor('message:text');
    const email = ctxEmail.message.text;
    if (email === '/cancel') {
      return;
    }
    console.log('[signup] Received email:', email);

    const newUser = {
      telegramId,
      name,
      email,
    };

    const result = await conversation.external(async () => upsertUser(newUser));

    if (!result.success) {
      if (result.validationError) {
        console.error('[signup] Validation error:', result.validationError);
        await ctx.reply(`❗️ Something went wrong:\n\n${result.validationError.map(({ field, error }) => `• ${field}: ${error}`).join('\n')}`);
        await conversation.rewind(preEmailCheckpoint);
      } else if (typeof result.databaseError === 'string') {
        console.error('[signup] Database error:', result.databaseError);
        await ctx.reply('❗️ Something went wrong, please try again later');
        return;
      }
    } else {
      await ctx.reply(`Perfect, we'll use "${email}" as email address!`);
      console.log('[signup] Saved user:', telegramId, name, email);
    }
    const parsingResult = userValidation.safeParse(newUser);
    if (!parsingResult.success) {
      console.error('[signup] Validation error:', parsingResult.error);
      await ctx.reply(`❗️ Something went wrong:\n${Object.entries(parsingResult.error.flatten().fieldErrors)
        .map(([field, errors]) => `• ${field}: ${errors.join(', ')}`)
        .join('\n')}`);
      await conversation.rewind(preEmailCheckpoint);
    }
  }
  bot.use(createConversation(signup, {
    id: signupConversationId,
  }));

  bot.command('start', async (ctx) => {
    console.log('[signup] Received start command');
    await ctx.conversation.enter(signupConversationId);
  });
}
