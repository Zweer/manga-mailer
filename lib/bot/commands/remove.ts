import type { Conversation } from '@grammyjs/conversations';
import type { Context } from 'grammy';

import type { BotContext, BotType } from '@/lib/bot/types';
import type { Manga, User } from '@/lib/db/model';

import { createConversation } from '@grammyjs/conversations';
import { InlineKeyboard } from 'grammy';

import { removeConversationId } from '@/lib/bot/constants';
import { listTrackedMangas, removeTrackedManga } from '@/lib/db/action/manga';
import { findUserByTelegramId } from '@/lib/db/action/user';
import { createChildLogger } from '@/lib/log';

const logger = createChildLogger('bot:command:remove');

export async function removeConversationLogic(
  conversation: Conversation,
  ctx: Context,
  user: User,
  trackedMangas: Manga[],
) {
  logger.debug('Entered remove conversation');

  if (trackedMangas.length === 0) {
    await ctx.reply('You\'re not tracking any manga right now. Nothing to remove!');
    return;
  }

  const keyboard = new InlineKeyboard();
  trackedMangas.forEach((manga) => {
    keyboard.text(`❌ ${manga.title} (${manga.chaptersCount})`, `remove:${manga.id}`).row();
  });
  keyboard.text('🚫 Cancel Operation', 'cancel_remove').row();

  await ctx.reply('Which manga do you want to stop tracking? Select from the list below:', {
    reply_markup: keyboard,
  });

  const answer = await conversation.waitFor('callback_query:data');
  const callbackData = answer.callbackQuery.data;

  if (callbackData === 'cancel_remove') {
    await ctx.answerCallbackQuery('Operation cancelled.');
    await ctx.editMessageText('Manga removal cancelled.', { reply_markup: undefined });
    return;
  }

  if (!callbackData.startsWith('remove:')) {
    await ctx.answerCallbackQuery('Invalid selection.');
    await ctx.editMessageText('Invalid selection. Please try /remove again.', { reply_markup: undefined });
    return;
  }

  const mangaIdToRemove = callbackData.substring('remove:'.length);
  const mangaToRemove = trackedMangas.find(m => m.id === mangaIdToRemove);

  if (!mangaToRemove) {
    await ctx.answerCallbackQuery('Manga not found in your list.');
    await ctx.editMessageText('Selected manga not found in your list. Please try /remove again.', { reply_markup: undefined });
    return;
  }

  const confirmationKeyboard = new InlineKeyboard()
    .text(`✅ Yes, remove "${mangaToRemove.title}"`, `confirm_remove:${mangaIdToRemove}`)
    .text('❌ No, keep it', 'cancel_remove_confirm')
    .row();

  await ctx.editMessageText(`Are you sure you want to stop tracking "${mangaToRemove.title}"?`, {
    reply_markup: confirmationKeyboard,
  });

  const confirmationAnswer = await conversation.waitFor('callback_query:data');
  const confirmationData = confirmationAnswer.callbackQuery.data;

  if (confirmationData === 'cancel_remove_confirm') {
    await ctx.answerCallbackQuery('Removal cancelled.');
    await ctx.editMessageText(`Ok, "${mangaToRemove.title}" will remain in your tracking list.`, { reply_markup: undefined });
    return;
  }

  if (confirmationData.startsWith(`confirm_remove:${mangaIdToRemove}`)) {
    const removeResult = await conversation.external(async () => removeTrackedManga(user.id, mangaIdToRemove));
    if (removeResult.success) {
      await ctx.answerCallbackQuery(`"${mangaToRemove.title}" removed!`);
      await ctx.editMessageText(`Successfully stopped tracking "${mangaToRemove.title}".`, { reply_markup: undefined });
      logger.info({ userId: user.id, mangaId: mangaIdToRemove, title: mangaToRemove.title }, 'User removed manga tracking');
    } else {
      await ctx.answerCallbackQuery('Error!');
      await ctx.editMessageText('Could not remove manga tracking due to an error. Please try again later.', { reply_markup: undefined });
      logger.error({ error: removeResult.databaseError, userId: user.id, mangaId: mangaIdToRemove }, 'Failed to remove manga tracking');
    }
  } else {
    await ctx.answerCallbackQuery('Invalid confirmation.');
    await ctx.editMessageText('Invalid confirmation. Removal cancelled.', { reply_markup: undefined });
  }
}

export function createRemoveConversation(bot: BotType) {
  bot.use(createConversation(removeConversationLogic, {
    id: removeConversationId,
  }));

  bot.command('remove', async (ctx: BotContext) => {
    logger.debug({ userId: ctx.from?.id }, 'Received /remove command');
    const user = await findUserByTelegramId(ctx.from!.id);

    if (!user) {
      await ctx.reply('You need to /start and register before you can remove manga.');
      return;
    }

    const trackedMangas = await listTrackedMangas(user.id);

    await ctx.conversation.enter(removeConversationId, user, trackedMangas);
  });
}
