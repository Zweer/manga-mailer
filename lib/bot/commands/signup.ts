import type { Conversation } from '@grammyjs/conversations';
import type { Context } from 'grammy';

import type { Bot } from '../';

import { createConversation } from '@grammyjs/conversations';

import { db } from '@/lib/db';
import { userTable } from '@/lib/db/model';

export function createSignupConversation(bot: Bot) {
  async function signup(conversation: Conversation, ctx: Context) {
    console.log('[signup] Entered signup conversation');
    await ctx.reply('Hi there! What is your name?');

    const ctxName = await conversation.waitFor('message:text');
    const telegramId = ctxName.chat.id;
    const name = ctxName.message.text;
    console.log('[signup] Received name', ctxName);
    await ctx.reply(`Welcome to Manga Mailer, ${name}!`);
    await ctx.reply(`Where do you want us to mail you updates?`);

    const ctxEmail = await conversation.waitFor('message:text');
    const email = ctxEmail.message.text;
    console.log('[signup] Received email', { ctx: ctxEmail });
    try {
      const response = await conversation.external(async () => db.insert(userTable).values({
        telegramId,
        name,
        email,
      }));

      await ctx.reply(`Perfect, we'll use "${email}" as email address!`);
      console.log('[signup] Saved user', { telegramId, name, email, response });
    } catch (error) {
      console.error('[signup] Error saving user', { error });
      await ctx.reply('❗️ Something went wrong, please try again later.');
    }
  }
  bot.use(createConversation(signup));

  bot.command('start', async (ctx) => {
    console.log('[signup] Received start command');
    await ctx.conversation.enter('signup');
  });
}
