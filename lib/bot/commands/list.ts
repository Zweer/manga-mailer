import type { BotType } from '@/lib/bot/types';

import { listTrackedMangas } from '@/lib/db/action/manga';
import { findUserByTelegramId } from '@/lib/db/action/user';
import { createChildLogger } from '@/lib/log';

const logger = createChildLogger('bot:command:list');

export function createListConversation(bot: BotType) {
  bot.command('list', async (ctx) => {
    logger.debug({ userId: ctx.from?.id }, 'Received /list command');
    const user = await findUserByTelegramId(ctx.from!.id);

    if (!user) {
      await ctx.reply('You need to /start and register before you can remove manga.');
      return;
    }

    const mangas = await listTrackedMangas(user.id);

    if (mangas.length === 0) {
      await ctx.reply('You\'re not tracking any manga yet: tap /track to track your first manga');
      return;
    }

    logger.debug({ userId: ctx.from?.id, trackedMangas: mangas.length });
    await ctx.reply(`Here is what you're currently tracking:\n\n${
      mangas.map(manga => `• ${manga.title} (${manga.chaptersCount})`).join('\n')
    }`);
  });
}
