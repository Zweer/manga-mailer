/* eslint-disable ts/unbound-method */
import type { Conversation } from '@grammyjs/conversations';

import type { BotContext, BotType } from '@/lib/bot/types';
import type {
  MockCommandContext,
} from '@/test/utils/contextMock';

import { InlineKeyboard } from 'grammy';

import { createTrackConversation, trackConversationLogic } from '@/lib/bot/commands/track';
import { signupConversationId, trackConversationId } from '@/lib/bot/constants';
import * as mangaActions from '@/lib/db/action/manga';
import * as userActions from '@/lib/db/action/user';
import * as mangaSearch from '@/lib/manga';
import {
  createMockCallbackQueryContext,
  createMockCommandContext,
  createMockMessageContext,
} from '@/test/utils/contextMock';

jest.mock('@/lib/db/action/user');
jest.mock('@/lib/db/action/manga');
jest.mock('@/lib/manga');

const mockedFindUserByTelegramId = userActions.findUserByTelegramId as jest.Mock;
const mockedSearchMangas = mangaSearch.searchMangas as jest.Mock;
const mockedGetManga = mangaSearch.getManga as jest.Mock;
const mockedTrackMangaAction = mangaActions.trackManga as jest.Mock;

describe('bot -> commands -> track', () => {
  let trackCommandHandler: ((ctx: MockCommandContext) => Promise<void>);

  const mockBotInstance: Partial<BotType> = {
    command: jest.fn((commandName, handler) => {
      if (commandName === 'track') {
        trackCommandHandler = handler;
      }
    }) as any,
    use: jest.fn().mockReturnThis(),
  };

  beforeAll(() => {
    createTrackConversation(mockBotInstance as BotType);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // eslint-disable-next-line ts/strict-boolean-expressions
    if (!trackCommandHandler) {
      throw new Error('/track command handler not registered');
    }
  });

  describe('command Handler: /track', () => {
    it('should enter trackConversation if user exists', async () => {
      const chatId = 2001;
      const ctx = createMockCommandContext('/track', chatId);
      mockedFindUserByTelegramId.mockResolvedValue({ id: 'user-id-track', name: 'Test Track User' });

      await trackCommandHandler(ctx);

      expect(mockedFindUserByTelegramId).toHaveBeenCalledWith(chatId);
      expect(ctx.conversation.enter).toHaveBeenCalledWith(trackConversationId);
    });

    it('should enter signupConversation if user does not exist', async () => {
      const chatId = 2002;
      const ctx = createMockCommandContext('/track', chatId);
      mockedFindUserByTelegramId.mockResolvedValue(undefined);

      await trackCommandHandler(ctx);

      expect(mockedFindUserByTelegramId).toHaveBeenCalledWith(chatId);
      expect(ctx.conversation.enter).toHaveBeenCalledWith(signupConversationId);
    });
  });

  describe('conversation Logic: trackConversationLogic', () => {
    const testChatId = 3001;
    const testUserId = 3001;

    let mockConversationControls: jest.Mocked<Conversation>;
    let currentCtx: BotContext;

    beforeEach(() => {
      mockConversationControls = {
        waitFor: jest.fn(),
        external: jest.fn(async (callback: () => any) => callback()) as any,
        checkpoint: jest.fn(),
        rewind: jest.fn().mockResolvedValue(undefined),
        log: jest.fn(),
        skip: jest.fn(),
        wait: jest.fn().mockResolvedValue(undefined),
      } as any;

      currentCtx = createMockMessageContext('', testChatId, testUserId);
    });

    it('happy Path: should guide user through tracking a new manga', async () => {
      const mangaTitle = 'Epic Adventure Manga';
      const searchedMangasResult = [
        { connectorName: 'TestConnectorA', id: 'manga-id-123', title: mangaTitle, chaptersCount: 10 },
      ];
      const selectedMangaData = { connectorName: 'TestConnectorA', id: 'manga-id-123' };
      const fullMangaDetails = {
        sourceName: 'TestConnectorA',
        sourceId: 'manga-id-123',
        title: mangaTitle,
        chaptersCount: 10,
        slug: 'epic-adventure',
        author: 'A. Uthor',
        artist: 'A. Rtist',
        excerpt: 'An epic excerpt.',
        image: 'url.jpg',
        url: 'manga.url',
        status: 'Ongoing',
        genres: ['action'],
        score: 0,
        releasedAt: new Date(),
      } as const;
      const lastReadChapter = '5';

      mockConversationControls.waitFor
        .mockResolvedValueOnce(createMockMessageContext(mangaTitle, testChatId, testUserId) as any)
        .mockResolvedValueOnce(createMockCallbackQueryContext(`${selectedMangaData.connectorName}:${selectedMangaData.id}`, testChatId, testUserId) as any)
        .mockResolvedValueOnce(createMockMessageContext(lastReadChapter, testChatId, testUserId) as any);

      mockedSearchMangas.mockResolvedValue(searchedMangasResult);
      mockedGetManga.mockResolvedValue(fullMangaDetails);
      mockedTrackMangaAction.mockResolvedValue({ success: true });

      await trackConversationLogic(mockConversationControls, currentCtx);

      const replyMock = currentCtx.reply as jest.Mock;
      expect(replyMock).toHaveBeenNthCalledWith(1, 'Hi there! What is the name of the manga you want to track?');
      expect(replyMock).toHaveBeenNthCalledWith(2, `Cool, I'm searching for "${mangaTitle}"...`);
      const expectedInlineKeyboard = InlineKeyboard.from([
        [InlineKeyboard.text(`[${searchedMangasResult[0].connectorName}] ${searchedMangasResult[0].title} (${searchedMangasResult[0].chaptersCount})`, `${searchedMangasResult[0].connectorName}:${searchedMangasResult[0].id}`)],
        [InlineKeyboard.text('❌ Cancel', '/cancel')],
      ]);
      expect(replyMock).toHaveBeenNthCalledWith(3, 'Please select the manga you want to track:', {
        reply_markup: expectedInlineKeyboard,
      });
      expect(replyMock).toHaveBeenNthCalledWith(4, 'Retrieving the selected manga...');
      expect(replyMock).toHaveBeenNthCalledWith(5, 'Which chapter you read last? (if you don\'t know, type "0")');
      expect(replyMock).toHaveBeenNthCalledWith(6, `Perfect, we'll track "${fullMangaDetails.title}" on "${fullMangaDetails.sourceName}"!`);

      expect(mockedSearchMangas).toHaveBeenCalledWith(mangaTitle);
      expect(mockedGetManga).toHaveBeenCalledWith(selectedMangaData.connectorName, selectedMangaData.id);
      expect(mockedTrackMangaAction).toHaveBeenCalledWith(fullMangaDetails, testChatId, Number.parseFloat(lastReadChapter));
    });

    it('should inform if no manga found after search', async () => {
      currentCtx = createMockMessageContext('', testChatId, testUserId);
      const mangaTitle = 'Unknown Manga';
      mockConversationControls.waitFor
        .mockResolvedValueOnce(createMockMessageContext(mangaTitle, testChatId, testUserId) as any);
      mockedSearchMangas.mockResolvedValue([]);

      await trackConversationLogic(mockConversationControls, currentCtx);

      const replyMock = currentCtx.reply as jest.Mock;
      expect(replyMock).toHaveBeenCalledWith('No manga found');
      expect(mockedGetManga).not.toHaveBeenCalled();
    });

    it('should handle user cancelling manga selection', async () => {
      currentCtx = createMockMessageContext('', testChatId, testUserId);
      const mangaTitle = 'Some Manga';
      const searchedMangasResult = [{ connectorName: 'TestConnectorA', id: 'manga-id-cancel', title: mangaTitle, chaptersCount: 1 }];

      mockConversationControls.waitFor
        .mockResolvedValueOnce(createMockMessageContext(mangaTitle, testChatId, testUserId) as any)
        .mockResolvedValueOnce(createMockCallbackQueryContext(`/cancel`, testChatId, testUserId, currentCtx.message) as any);

      mockedSearchMangas.mockResolvedValue(searchedMangasResult);

      await trackConversationLogic(mockConversationControls, currentCtx);
      const replyMock = currentCtx.reply as jest.Mock;

      expect(replyMock).toHaveBeenCalledTimes(3);
      expect(mockedGetManga).not.toHaveBeenCalled();
    });

    it('should reply with invalid user if trackManga action returns invalidUser', async () => {
      currentCtx = createMockMessageContext('', testChatId, testUserId);
      const mangaTitle = 'Test Manga';
      const selectedMangaString = 'TestConnectorA:manga123';
      const lastChapter = '0';

      mockConversationControls.waitFor
        .mockResolvedValueOnce(createMockMessageContext(mangaTitle, testChatId, testUserId) as any)
        .mockResolvedValueOnce(createMockCallbackQueryContext(selectedMangaString, testChatId, testUserId, currentCtx.message) as any)
        .mockResolvedValueOnce(createMockMessageContext(lastChapter, testChatId, testUserId) as any);

      mockedSearchMangas.mockResolvedValue([{ connectorName: 'TestConnectorA', id: 'manga123', title: mangaTitle, chaptersCount: 1 }]);
      mockedGetManga.mockResolvedValue({ sourceName: 'TestConnectorA', sourceId: 'manga123', title: mangaTitle });
      mockedTrackMangaAction.mockResolvedValue({ success: false, invalidUser: true, alreadyTracked: false });

      await trackConversationLogic(mockConversationControls, currentCtx);
      const replyMock = currentCtx.reply as jest.Mock;
      expect(replyMock).toHaveBeenLastCalledWith('❗️ Invalid user. Please try to /start again');
    });

    it('should reply with already tracking if trackManga action returns alreadyTracked', async () => {
      currentCtx = createMockMessageContext('', testChatId, testUserId);
      const mangaTitle = 'Test Manga';
      const selectedMangaString = 'TestConnectorA:manga123';
      const lastChapter = '0';

      mockConversationControls.waitFor
        .mockResolvedValueOnce(createMockMessageContext(mangaTitle, testChatId, testUserId) as any)
        .mockResolvedValueOnce(createMockCallbackQueryContext(selectedMangaString, testChatId, testUserId, currentCtx.message) as any)
        .mockResolvedValueOnce(createMockMessageContext(lastChapter, testChatId, testUserId) as any);

      mockedSearchMangas.mockResolvedValue([{ connectorName: 'TestConnectorA', id: 'manga123', title: mangaTitle, chaptersCount: 1 }]);
      mockedGetManga.mockResolvedValue({ sourceName: 'TestConnectorA', sourceId: 'manga123', title: mangaTitle });
      mockedTrackMangaAction.mockResolvedValue({ success: false, invalidUser: false, alreadyTracked: true });

      await trackConversationLogic(mockConversationControls, currentCtx);
      const replyMock = currentCtx.reply as jest.Mock;
      expect(replyMock).toHaveBeenLastCalledWith('❗️ It seems you\'re already tracking this manga!');
    });

    it('should reply with database error if trackManga action returns alreadyTracked', async () => {
      currentCtx = createMockMessageContext('', testChatId, testUserId);
      const mangaTitle = 'Test Manga';
      const selectedMangaString = 'TestConnectorA:manga123';
      const lastChapter = '0';

      mockConversationControls.waitFor
        .mockResolvedValueOnce(createMockMessageContext(mangaTitle, testChatId, testUserId) as any)
        .mockResolvedValueOnce(createMockCallbackQueryContext(selectedMangaString, testChatId, testUserId, currentCtx.message) as any)
        .mockResolvedValueOnce(createMockMessageContext(lastChapter, testChatId, testUserId) as any);

      mockedSearchMangas.mockResolvedValue([{ connectorName: 'TestConnectorA', id: 'manga123', title: mangaTitle, chaptersCount: 1 }]);
      mockedGetManga.mockResolvedValue({ sourceName: 'TestConnectorA', sourceId: 'manga123', title: mangaTitle });
      mockedTrackMangaAction.mockResolvedValue({ success: false, invalidUser: false, alreadyTracked: false, databaseError: 'Database error' });

      await trackConversationLogic(mockConversationControls, currentCtx);
      const replyMock = currentCtx.reply as jest.Mock;
      expect(replyMock).toHaveBeenLastCalledWith('❗️ Something went wrong, please try again later');
    });
  });
});
