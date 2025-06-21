import type { Conversation } from '@grammyjs/conversations';
import type { Context } from 'grammy';

import type { BotType } from '../index.js';

import { createConversation } from '@grammyjs/conversations';
import { getUser, retrieveManga, searchMangas, trackManga, type User } from '@zweer/manga-mailer-service';
import { InlineKeyboard } from 'grammy';

import { logger } from '../../../utils.js';
import { trackConversationId } from '../constants.js';

export async function trackConversationLogic(conversation: Conversation, ctx: Context, user: User) {
  logger.debug('Entered track conversation');
  await ctx.reply('Hi there! What is the name of the manga you want to track?');

  const ctxName = await conversation.waitFor('message:text');
  const title = ctxName.message.text;
  logger.debug(`Received title: "${title}"`);
  await ctx.reply(`Cool, I'm searching for "${title}"...`);
  const mangas = await conversation.external(async () => searchMangas(title));

  if (mangas.length === 0) {
    logger.debug('No mangas found');
    await ctx.reply('No mangas found');
    return;
  }

  logger.debug(`Found ${mangas.length} mangas`);

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
  logger.debug(`Retrieving selected manga: "${mangaId}" @ "${connectorName}"`);
  await ctx.reply('Retrieving the selected manga...');

  const manga = await conversation.external(async () => retrieveManga(connectorName, mangaId));
  await ctx.reply('Which chapter you read last? (if you don\'t know, type "0")');

  const ctxChapter = await conversation.waitFor('message:text');
  const lastReadChapter = Number.parseFloat(ctxChapter.message.text);
  logger.debug(`Last chapter read: ${lastReadChapter}`);
  const result = await conversation.external(async () => trackManga(manga, user.id, lastReadChapter));

  if (result.success) {
    logger.debug('Manga tracked', { title: manga.title, source: manga.connector, userId: user.id });
    await ctx.reply(`Perfect, we'll track "${manga.title}" on "${manga.connector}"!`);
  } else if (result.alreadyTracked) {
    logger.error('Manga already tracked');
    await ctx.reply('❗️ It seems you\'re already tracking this manga!');
  } else {
    logger.error('Database error', { errors: [result.databaseError] });
    await ctx.reply('❗️ Something went wrong, please try again later');
  }
}

export function createTrackConversation(bot: BotType) {
  bot.use(createConversation(trackConversationLogic, {
    id: trackConversationId,
  }));

  bot.command('track', async (ctx) => {
    const userId = ctx.from!.id;
    logger.debug('Received /track command', { userId });

    const user = await getUser(userId);

    if (!user) {
      await ctx.reply('You need to /start and register before you can remove manga.');
      return;
    }

    await ctx.conversation.enter(trackConversationId, user);
  });
}
