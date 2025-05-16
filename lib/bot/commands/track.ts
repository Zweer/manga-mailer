import type { Conversation } from '@grammyjs/conversations';
import type { Context } from 'grammy';

import type { BotType } from '@/lib/bot/types';

import { createConversation } from '@grammyjs/conversations';
import { InlineKeyboard } from 'grammy';

import { signupConversationId, trackConversationId } from '@/lib/bot/constants';
import { trackManga } from '@/lib/db/action/manga';
import { findUserByTelegramId } from '@/lib/db/action/user';
import { logger as originalLogger } from '@/lib/logger';
import { getManga, searchMangas } from '@/lib/manga';

const logger = originalLogger.child({ name: 'bot:command:track' });

export async function trackConversationLogic(conversation: Conversation, ctx: Context) {
  logger.debug('Entered track conversation');
  await ctx.reply('Hi there! What is the name of the manga you want to track?');

  const ctxName = await conversation.waitFor('message:text');
  const telegramId = ctxName.chat.id;
  const title = ctxName.message.text;
  logger.debug('Received title', title);
  await ctx.reply(`Cool, I'm searching for "${title}"...`);
  const mangas = await conversation.external(async () => searchMangas(title));

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

  const ctxManga = await conversation.waitFor('callback_query:data');
  const data = ctxManga.callbackQuery.data;
  if (data === '/cancel') {
    return;
  }
  const [connectorName, mangaId] = data.split(':');
  await ctx.reply('Retrieving the selected manga...');

  const manga = await conversation.external(async () => getManga(connectorName, mangaId));
  await ctx.reply('Which chapter you read last? (if you don\'t know, type "0")');

  const ctxChapter = await conversation.waitFor('message:text');
  const lastReadChapter = Number.parseFloat(ctxChapter.message.text);
  const result = await conversation.external(async () => trackManga(manga, telegramId, lastReadChapter));

  if (result.success) {
    await ctx.reply(`Perfect, we'll track "${manga.title}" on "${manga.sourceName}"!`);
  } else if (result.invalidUser) {
    await ctx.reply('❗️ Invalid user. Please try to /start again');
  } else if (result.alreadyTracked) {
    await ctx.reply('❗️ It seems you\'re already tracking this manga!');
  } else {
    logger.error('Database error:', result.databaseError);
    await ctx.reply('❗️ Something went wrong, please try again later');
  }
}

export function createTrackConversation(bot: BotType) {
  bot.use(createConversation(trackConversationLogic, {
    id: trackConversationId,
  }));

  bot.command('track', async (ctx) => {
    const telegramId = ctx.chat.id;
    logger.debug('Received track command', telegramId);
    const user = await findUserByTelegramId(telegramId);

    if (user) {
      await ctx.conversation.enter(trackConversationId);
    } else {
      await ctx.conversation.enter(signupConversationId);
    }
  });
}
