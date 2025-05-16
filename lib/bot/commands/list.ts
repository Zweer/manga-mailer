import type { BotType } from '@/lib/bot/types';

import { signupConversationId } from '@/lib/bot/constants';
import { listTrackedMangas } from '@/lib/db/action/manga';
import { findUserByTelegramId } from '@/lib/db/action/user';
import { logger as originalLogger } from '@/lib/logger';

const logger = originalLogger.child({ name: 'bot:command:list' });

export function createListConversation(bot: BotType) {
  bot.command('list', async (ctx) => {
    const telegramId = ctx.chat.id;
    logger.debug('Received list command', telegramId);
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
