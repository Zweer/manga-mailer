import type { Bot } from '@/lib/bot';

import { signupConversationId } from '@/lib/bot/constants';
import { listTrackedMangas } from '@/lib/db/action/manga';
import { findUserByTelegramId } from '@/lib/db/action/user';

export function createListConversation(bot: Bot) {
  bot.command('list', async (ctx) => {
    const telegramId = ctx.chat.id;
    console.log('[track] Received list command', telegramId);
    const user = await findUserByTelegramId(telegramId);
    if (!user) {
      await ctx.conversation.enter(signupConversationId);
      return;
    }

    const mangas = await listTrackedMangas(user.id);

    if (mangas.length === 0) {
      await ctx.reply('You\'re not tracking any manga yet: tap /track to track your first manga');
      return;
    }

    await ctx.reply(`Here is what you're currently tracking:\n\n${
      mangas.map(manga => `• ${manga.title} (${manga.chaptersCount})`).join('\n')
    }`);
  });
}
