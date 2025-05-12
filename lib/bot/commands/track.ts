import type { Conversation } from '@grammyjs/conversations';
import type { AxiosError } from 'axios';
import type { Context } from 'grammy';

import type { Bot } from '../';

import { createConversation } from '@grammyjs/conversations';
import { InlineKeyboard } from 'grammy';
import { search } from '@/lib/manga';
import { db } from '@/lib/db';
import { userTable } from '@/lib/db/model';
import { eq } from 'drizzle-orm';

export function createTrackConversation(bot: Bot) {
  async function track(conversation: Conversation, ctx: Context) {
    console.log('[track] Entered track conversation');
    await ctx.reply('Hi there! What is the name of the manga you want to track?');

    const ctxName = await conversation.waitFor('message:text');
    const title = ctxName.message.text;
    console.log('[track] Received name', ctxName);
    await ctx.reply(`Cool, I'm searching for "${title}"...`);
    // const mangas = await conversation.external(async () => search(title));
    const mangas = await search(title)
      .catch((error: AxiosError) => {
        console.error('[track] Error while searching', { error }, { response: error.response });
        return [];
      });

    if (mangas.length === 0) {
      await ctx.reply('No manga found');
      return;
    }

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
    console.log('[track] Received track command', { ctx });
    const telegramId = ctx.chat.id;
    const user = await db.query.userTable.findFirst({
      where: eq(userTable.telegramId, telegramId),
    });

    if (user) {
      await ctx.conversation.enter('track');
    } else {
      await ctx.conversation.enter('signup');
    }
  });
}
