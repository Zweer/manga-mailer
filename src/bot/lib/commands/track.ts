import type { Logger } from '@aws-lambda-powertools/logger';
import type { Conversation } from '@grammyjs/conversations';
import type { Context } from 'grammy';

import type { Bot } from '../bot';

import { createConversation } from '@grammyjs/conversations';
import { userRepository } from '@zweer/manga-mailer-database';
import { search } from '@zweer/manga-mailer-manga';
import { InlineKeyboard } from 'grammy';

export function createTrackConversation(bot: Bot, logger: Logger) {
  async function track(conversation: Conversation, ctx: Context) {
    logger.info('[track] Entered track conversation', { ctx });
    await ctx.reply('Hi there! What is the name of the manga you want to track?');

    const ctxName = await conversation.waitFor('message:text');
    const title = ctxName.message.text;
    logger.info('[track] Received name', { ctx: ctxName });
    await ctx.reply(`Cool, I'm searching for "${title}"...`);
    const mangas = await conversation.external(async () => search(title));

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
    logger.info('[track] Received track command', { ctx });
    const user = await userRepository.get({ userId: ctx.chat.id });

    if (user.Item) {
      await ctx.conversation.enter('track');
    } else {
      await ctx.conversation.enter('signup');
    }
  });
}
