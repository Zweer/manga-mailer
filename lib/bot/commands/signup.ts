import type { Conversation } from '@grammyjs/conversations';
import type { Context } from 'grammy';

import type { Bot } from '../';

import { createConversation } from '@grammyjs/conversations';
import { eq } from 'drizzle-orm';

import { signupConversationId } from '@/lib/bot/constants';
import { db } from '@/lib/db';
import { userTable } from '@/lib/db/model';
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
    console.log('[signup] Received email:', email);

    const newUser = {
      telegramId,
      name,
      email,
    };
    const parsingResult = userValidation.safeParse(newUser);
    if (!parsingResult.success) {
      console.error('[signup] Validation error:', parsingResult.error);
      await ctx.reply(`❗️ Something went wrong:\n${Object.entries(parsingResult.error.flatten().fieldErrors)
        .map(([field, errors]) => `• ${field}: ${errors.join(', ')}`)
        .join('\n')}`);
      await conversation.rewind(preEmailCheckpoint);
    }

    try {
      await conversation.external(async () => {
        const user = await db.query.userTable.findFirst({
          where: eq(userTable.telegramId, telegramId),
        });

        if (user) {
          await db.update(userTable).set(user);
        } else {
          db.insert(userTable).values(newUser);
        }
      });

      await ctx.reply(`Perfect, we'll use "${email}" as email address!`);
      console.log('[signup] Saved user:', telegramId, name, email);
    } catch (error) {
      console.error('[signup] Error saving user', { error });
      await ctx.reply('❗️ Something went wrong, please try again later.');
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
