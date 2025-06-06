/* eslint-disable ts/unbound-method */
import type { Mock } from 'vitest';

import type { BotType } from '@/lib/bot/types';
import type {
  MockCommandContext,
} from '@/test/mocks/bot/context';

import { InlineKeyboard } from 'grammy';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTrackConversation, trackConversationLogic } from '@/lib/bot/commands/track';
import { trackConversationId } from '@/lib/bot/constants';
import { loggerWriteSpy } from '@/test/log';
import {
  createMockCallbackQueryContext,
  createMockCommandContext,
  createMockConversationControl,
  createMockMessageContext,
} from '@/test/mocks/bot/context';
import {
  mockedTrackManga,
  mockTrackMangaAlreadyTracked,
  mockTrackMangaDbError,
  mockTrackMangaSuccess,
} from '@/test/mocks/db/manga';
import {
  mockedFindUserByTelegramId,
  mockFindUserByTelegramIdNotFound,
  mockFindUserByTelegramIdSuccess,
} from '@/test/mocks/db/user';
import { mockedGetManga, mockedSearchMangas, mockGetMangaSuccess, mockSearchMangaSuccess } from '@/test/mocks/manga';

vi.mock('@/lib/db/action/manga', () => ({
  listTrackedMangas: vi.fn(),
  removeTrackedManga: vi.fn(),
  trackManga: vi.fn(),
}));
vi.mock('@/lib/db/action/user', () => ({
  findUserByTelegramId: vi.fn(),
  upsertUser: vi.fn(),
}));
vi.mock('@/lib/manga', () => ({
  getManga: vi.fn(),
  searchMangas: vi.fn(),
  getChapters: vi.fn(),
  getChapter: vi.fn(),
}));

describe('bot -> commands -> track', () => {
  let trackCommandHandler: ((context: MockCommandContext) => Promise<void>);

  const mockBotInstance: Partial<BotType> = {
    command: vi.fn((commandName, handler) => {
      if (commandName === 'track') {
        trackCommandHandler = handler;
      }
    }) as any,
    use: vi.fn().mockReturnThis(),
  };

  beforeEach(() => {
    createTrackConversation(mockBotInstance as BotType);
    // eslint-disable-next-line ts/strict-boolean-expressions
    if (!trackCommandHandler) {
      throw new Error('/track command handler not registered');
    }
  });

  it('should register a "track" command handler on the bot', () => {
    expect(mockBotInstance.command).toHaveBeenCalledWith('track', expect.any(Function));
  });

  describe('command Handler: /track', () => {
    it('should enter trackConversation if user exists', async () => {
      const context = createMockCommandContext('/track');
      const user = mockFindUserByTelegramIdSuccess();

      await trackCommandHandler(context);

      expect(mockedFindUserByTelegramId).toHaveBeenCalledWith(context.from?.id);
      expect(context.conversation.enter).toHaveBeenCalledWith(trackConversationId, user);

      expect(loggerWriteSpy).toHaveBeenCalledTimes(1);
      expect(loggerWriteSpy).toHaveBeenLastCalledWith({
        level: 'debug',
        serviceName: 'bot:command:track',
        msg: 'Received /track command',
        userId: context.from?.id,
      });
    });

    it('should not enter trackConversation if user does not exist', async () => {
      const context = createMockCommandContext('/track');
      mockFindUserByTelegramIdNotFound();

      await trackCommandHandler(context);

      expect(mockedFindUserByTelegramId).toHaveBeenCalledWith(context.from?.id);
      expect(context.conversation.enter).not.toHaveBeenCalled();

      const replyMock = context.reply as Mock;
      expect(replyMock).toHaveBeenLastCalledWith('You need to /start and register before you can remove manga.');

      expect(loggerWriteSpy).toHaveBeenCalledTimes(1);
      expect(loggerWriteSpy).toHaveBeenLastCalledWith({
        level: 'debug',
        serviceName: 'bot:command:track',
        msg: 'Received /track command',
        userId: context.from?.id,
      });
    });
  });

  describe('conversation Logic: trackConversationLogic', () => {
    const mockConversationControls = createMockConversationControl();
    const context = createMockMessageContext('');

    it('happy Path: should guide user through tracking a new manga', async () => {
      const user = mockFindUserByTelegramIdSuccess();
      const autocompleteMangas = mockSearchMangaSuccess([{}]);
      const manga = mockGetMangaSuccess();
      const lastReadChapter = '5';
      mockTrackMangaSuccess();

      mockConversationControls.waitFor
        .mockResolvedValueOnce(createMockMessageContext(manga.title!) as any)
        .mockResolvedValueOnce(createMockCallbackQueryContext(
          `${autocompleteMangas[0].connectorName}:${autocompleteMangas[0].id}`,
          context.chat!.id,
          context.from!.id,
          context.message,
        ) as any)
        .mockResolvedValueOnce(createMockMessageContext(lastReadChapter) as any);

      await trackConversationLogic(mockConversationControls, context, user);

      const replyMock = context.reply as Mock;
      expect(replyMock).toHaveBeenNthCalledWith(1, 'Hi there! What is the name of the manga you want to track?');
      expect(replyMock).toHaveBeenNthCalledWith(2, `Cool, I'm searching for "${manga.title}"...`);
      const expectedInlineKeyboard = InlineKeyboard.from([
        [InlineKeyboard.text(
          `[${autocompleteMangas[0].connectorName}] ${autocompleteMangas[0].title} (${autocompleteMangas[0].chaptersCount})`,
          `${autocompleteMangas[0].connectorName}:${autocompleteMangas[0].id}`,
        )],
        [InlineKeyboard.text('❌ Cancel', '/cancel')],
      ]);
      expect(replyMock).toHaveBeenNthCalledWith(3, 'Please select the manga you want to track:', {
        reply_markup: expectedInlineKeyboard,
      });
      expect(replyMock).toHaveBeenNthCalledWith(4, 'Retrieving the selected manga...');
      expect(replyMock).toHaveBeenNthCalledWith(5, 'Which chapter you read last? (if you don\'t know, type "0")');
      expect(replyMock).toHaveBeenNthCalledWith(6, `Perfect, we'll track "${manga.title}" on "${manga.sourceName}"!`);

      expect(mockedSearchMangas).toHaveBeenCalledWith(manga.title);
      expect(mockedGetManga).toHaveBeenCalledWith(autocompleteMangas[0].connectorName, autocompleteMangas[0].id);
      expect(mockedTrackManga).toHaveBeenCalledWith(manga, user.id, Number.parseFloat(lastReadChapter));

      expect(loggerWriteSpy).toHaveBeenCalledTimes(6);
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
        level: 'debug',
        serviceName: 'bot:command:track',
        msg: 'Entered track conversation',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
        level: 'debug',
        serviceName: 'bot:command:track',
        msg: 'Received title: "Epic Adventure Manga"',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
        level: 'debug',
        serviceName: 'bot:command:track',
        msg: 'Found 1 mangas',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(4, {
        level: 'debug',
        serviceName: 'bot:command:track',
        msg: 'Retrieving selected manga: "manga-source-id-123" @ "TestConnectorA"',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(5, {
        level: 'debug',
        serviceName: 'bot:command:track',
        msg: 'Last chapter read: 5',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(6, {
        level: 'debug',
        serviceName: 'bot:command:track',
        msg: 'Manga tracked',
        source: 'TestConnectorA',
        title: 'Epic Adventure Manga',
        userId: 'test-user-id',
      });
    });

    it('should inform if no manga found after search', async () => {
      const mangaTitle = 'Unknown Manga';
      const user = mockFindUserByTelegramIdSuccess();
      mockSearchMangaSuccess();

      mockConversationControls.waitFor
        .mockResolvedValueOnce(createMockMessageContext(mangaTitle) as any);

      await trackConversationLogic(mockConversationControls, context, user);

      const replyMock = context.reply as Mock;
      expect(replyMock).toHaveBeenCalledTimes(3);
      expect(replyMock).toHaveBeenCalledWith('No mangas found');

      expect(mockedSearchMangas).toHaveBeenCalledWith(mangaTitle);
      expect(mockedGetManga).not.toHaveBeenCalled();

      expect(loggerWriteSpy).toHaveBeenCalledTimes(3);
    });

    it('should handle user cancelling manga selection', async () => {
      const mangaTitle = 'Some Manga';
      const user = mockFindUserByTelegramIdSuccess();
      mockSearchMangaSuccess([{}]);

      mockConversationControls.waitFor
        .mockResolvedValueOnce(createMockMessageContext(mangaTitle) as any)
        .mockResolvedValueOnce(createMockCallbackQueryContext(
          `/cancel`,
          context.chat!.id,
          context.from!.id,
          context.message,
        ) as any);

      await trackConversationLogic(mockConversationControls, context, user);

      const replyMock = context.reply as Mock;
      expect(replyMock).toHaveBeenCalledTimes(3);

      expect(mockedSearchMangas).toHaveBeenCalledWith(mangaTitle);
      expect(mockedGetManga).not.toHaveBeenCalled();

      expect(loggerWriteSpy).toHaveBeenCalledTimes(3);
    });

    it('should reply with invalid user if trackManga action returns alreadyTracked', async () => {
      const user = mockFindUserByTelegramIdSuccess();
      const autocompleteMangas = mockSearchMangaSuccess([{}]);
      const manga = mockGetMangaSuccess();
      const lastChapter = '0';
      mockTrackMangaAlreadyTracked();

      mockConversationControls.waitFor
        .mockResolvedValueOnce(createMockMessageContext(manga.title!) as any)
        .mockResolvedValueOnce(createMockCallbackQueryContext(
          `${autocompleteMangas[0].connectorName}:${autocompleteMangas[0].id}`,
          context.chat!.id,
          context.from!.id,
          context.message,
        ) as any)
        .mockResolvedValueOnce(createMockMessageContext(lastChapter) as any);

      await trackConversationLogic(mockConversationControls, context, user);

      const replyMock = context.reply as Mock;
      expect(replyMock).toHaveBeenCalledTimes(6);
      expect(replyMock).toHaveBeenLastCalledWith('❗️ It seems you\'re already tracking this manga!');

      expect(loggerWriteSpy).toHaveBeenCalledTimes(6);
    });

    it('should reply with invalid user if trackManga action returns databaseError', async () => {
      const user = mockFindUserByTelegramIdSuccess();
      const autocompleteMangas = mockSearchMangaSuccess([{}]);
      const manga = mockGetMangaSuccess();
      const lastChapter = '0';
      mockTrackMangaDbError();

      mockConversationControls.waitFor
        .mockResolvedValueOnce(createMockMessageContext(manga.title!) as any)
        .mockResolvedValueOnce(createMockCallbackQueryContext(
          `${autocompleteMangas[0].connectorName}:${autocompleteMangas[0].id}`,
          context.chat!.id,
          context.from!.id,
          context.message,
        ) as any)
        .mockResolvedValueOnce(createMockMessageContext(lastChapter) as any);

      await trackConversationLogic(mockConversationControls, context, user);

      const replyMock = context.reply as Mock;
      expect(replyMock).toHaveBeenCalledTimes(6);
      expect(replyMock).toHaveBeenLastCalledWith('❗️ Something went wrong, please try again later');

      expect(loggerWriteSpy).toHaveBeenCalledTimes(6);
    });
  });
});
