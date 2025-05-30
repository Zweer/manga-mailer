/* eslint-disable ts/unbound-method */
import type { Conversation } from '@grammyjs/conversations';

import type { BotContext, BotType } from '@/lib/bot/types';
import type { Manga, User } from '@/lib/db/model';
import type {
  MockCommandContext,
} from '@/test/mocks/bot/context';

import { InlineKeyboard } from 'grammy';

import { createRemoveConversation, removeConversationLogic } from '@/lib/bot/commands/remove';
import { removeConversationId } from '@/lib/bot/constants';
import { loggerWriteSpy } from '@/test/log';
import {
  createMockCallbackQueryContext,
  createMockCommandContext,
} from '@/test/mocks/bot/context';
import {
  mockedListTrackedMangas,
  mockedRemoveTrackedManga,
  mockListTrackedMangasSuccess,
  mockRemoveTrackedMangaDbError,
  mockRemoveTrackedMangaSuccess,
} from '@/test/mocks/db/manga';
import { mockedFindUserByTelegramId, mockFindUserByTelegramIdSuccess } from '@/test/mocks/db/user';

jest.mock('@/lib/db/action/manga', () => ({
  listTrackedMangas: jest.fn(),
  removeTrackedManga: jest.fn(),
}));
jest.mock('@/lib/db/action/user', () => ({
  findUserByTelegramId: jest.fn(),
}));

describe('bot -> commands -> remove', () => {
  let removeCommandHandler: ((ctx: MockCommandContext) => Promise<void>);

  const mockBotInstance: Partial<BotType> = {
    command: jest.fn((commandName, handler) => {
      if (commandName === 'remove') {
        removeCommandHandler = handler;
      }
    }) as any,
    use: jest.fn().mockReturnThis(),
  };

  beforeAll(() => {
    createRemoveConversation(mockBotInstance as BotType);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // eslint-disable-next-line ts/strict-boolean-expressions
    if (!removeCommandHandler) {
      throw new Error('/remove command handler not registered');
    }
  });

  describe('command Handler: /remove', () => {
    it('should enter signupConversation if user does not exist', async () => {
      const context = createMockCommandContext('/remove');

      await removeCommandHandler(context);

      expect(mockedFindUserByTelegramId).toHaveBeenCalledWith(context.from?.id);
      expect(context.reply).toHaveBeenCalledWith('You need to /start and register before you can remove manga.');
      expect(context.conversation.enter).not.toHaveBeenCalled();

      expect(loggerWriteSpy).toHaveBeenCalledTimes(1);
      expect(loggerWriteSpy).toHaveBeenLastCalledWith({
        level: 'debug',
        serviceName: 'bot:command:remove',
        msg: 'Received /remove command',
        userId: context.from?.id,
      });
    });

    it('should enter removeManga conversation if user exists and has no tracked mangas', async () => {
      const user = mockFindUserByTelegramIdSuccess();
      const trackedMangas = mockListTrackedMangasSuccess([]);
      const context = createMockCommandContext('/remove');

      await removeCommandHandler(context);

      expect(mockedFindUserByTelegramId).toHaveBeenCalledWith(context.from?.id);
      expect(mockedListTrackedMangas).toHaveBeenCalledWith(user.id);
      expect(context.conversation.enter).toHaveBeenCalledWith(removeConversationId, user, trackedMangas);

      expect(loggerWriteSpy).toHaveBeenCalledTimes(1);
      expect(loggerWriteSpy).toHaveBeenLastCalledWith({
        level: 'debug',
        serviceName: 'bot:command:remove',
        msg: 'Received /remove command',
        userId: context.from?.id,
      });
    });

    it('should enter removeManga conversation if user exists and has tracked mangas', async () => {
      const user = mockFindUserByTelegramIdSuccess();
      const trackedMangas = mockListTrackedMangasSuccess([{}, {}]);
      const context = createMockCommandContext('/remove');

      await removeCommandHandler(context);

      expect(mockedFindUserByTelegramId).toHaveBeenCalledWith(context.from?.id);
      expect(mockedListTrackedMangas).toHaveBeenCalledWith(user.id);
      expect(context.conversation.enter).toHaveBeenCalledWith(removeConversationId, user, trackedMangas);

      expect(loggerWriteSpy).toHaveBeenCalledTimes(1);
      expect(loggerWriteSpy).toHaveBeenLastCalledWith({
        level: 'debug',
        serviceName: 'bot:command:remove',
        msg: 'Received /remove command',
        userId: context.from?.id,
      });
    });
  });

  describe('conversation Logic: removeConversationLogic', () => {
    let mockConversationControls: jest.Mocked<Conversation>;
    let context: BotContext;
    let user: User;

    beforeEach(() => {
      mockConversationControls = {
        waitFor: jest.fn(),
        external: jest.fn(async (callback: () => any) => callback()),
        log: jest.fn(),
        skip: jest.fn(),
        wait: jest.fn().mockResolvedValue(undefined),
        session: {} as any,
        __flavor: undefined as any,
      } as any;

      user = mockFindUserByTelegramIdSuccess();

      context = createMockCommandContext('/remove') as BotContext;
    });

    it('should inform user if they are not tracking any manga (inside conversation)', async () => {
      const trackedMangas = mockListTrackedMangasSuccess([]);

      await removeConversationLogic(mockConversationControls, context, user, trackedMangas);

      const replyMock = context.reply as jest.Mock;
      expect(replyMock).toHaveBeenCalledWith('You\'re not tracking any manga right now. Nothing to remove!');
      expect(mockConversationControls.waitFor).not.toHaveBeenCalled();
    });

    describe('user has trackedMangas', () => {
      let trackedMangas: Manga[];

      beforeEach(() => {
        trackedMangas = mockListTrackedMangasSuccess([{}, {}]);
      });

      it('happy Path: should list mangas, user selects one, confirms, and manga is removed', async () => {
        mockRemoveTrackedMangaSuccess();

        const mangaToRemove = trackedMangas[0];
        const callbackDataSelectManga = `remove:${mangaToRemove.id}`;
        const callbackDataConfirmRemove = `confirm_remove:${mangaToRemove.id}`;

        mockConversationControls.waitFor
          .mockResolvedValueOnce(createMockCallbackQueryContext(callbackDataSelectManga, context.chat?.id, user.telegramId, context.message) as any)
          .mockResolvedValueOnce(createMockCallbackQueryContext(callbackDataConfirmRemove, context.chat?.id, user.telegramId, context.message) as any);

        await removeConversationLogic(mockConversationControls, context, user, trackedMangas);

        const replyMock = context.reply as jest.Mock;
        const editMessageTextMock = (context as any).editMessageText as jest.Mock;
        const answerCallbackQueryMock = (context as any).answerCallbackQuery as jest.Mock;

        const expectedKeyboard = new InlineKeyboard();
        trackedMangas.forEach(m => expectedKeyboard.text(`❌ ${m.title} (${m.chaptersCount})`, `remove:${m.id}`).row());
        expectedKeyboard.text('🚫 Cancel Operation', 'cancel_remove').row();
        expect(replyMock).toHaveBeenCalledWith('Which manga do you want to stop tracking? Select from the list below:', {
          reply_markup: expectedKeyboard,
        });

        const confirmationKeyboard = new InlineKeyboard()
          .text(`✅ Yes, remove "${mangaToRemove.title}"`, `confirm_remove:${mangaToRemove.id}`)
          .text('❌ No, keep it', 'cancel_remove_confirm')
          .row();
        expect(editMessageTextMock).toHaveBeenNthCalledWith(1, `Are you sure you want to stop tracking "${mangaToRemove.title}"?`, {
          reply_markup: confirmationKeyboard,
        });

        expect(mockedRemoveTrackedManga).toHaveBeenCalledWith(user.id, mangaToRemove.id);

        expect(answerCallbackQueryMock).toHaveBeenCalledWith(`"${mangaToRemove.title}" removed!`);
        expect(editMessageTextMock).toHaveBeenNthCalledWith(2, `Successfully stopped tracking "${mangaToRemove.title}".`, { reply_markup: undefined });

        expect(loggerWriteSpy).toHaveBeenCalledTimes(2);
        expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
          level: 'debug',
          serviceName: 'bot:command:remove',
          msg: 'Entered remove conversation',
        });
        expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
          level: 'info',
          serviceName: 'bot:command:remove',
          msg: 'User removed manga tracking',
          mangaId: 'manga-id-123',
          title: 'Epic Adventure Manga',
          userId: 'test-user-id',
        });
      });

      it('should handle user cancelling at manga selection', async () => {
        const callbackDataCancel = 'cancel_remove';
        mockConversationControls.waitFor
          .mockResolvedValueOnce(createMockCallbackQueryContext(callbackDataCancel, context.chat?.id, user.telegramId, context.message) as any);

        await removeConversationLogic(mockConversationControls, context, user, trackedMangas);

        const editMessageTextMock = (context as any).editMessageText as jest.Mock;
        const answerCallbackQueryMock = (context as any).answerCallbackQuery as jest.Mock;
        expect(answerCallbackQueryMock).toHaveBeenCalledWith('Operation cancelled.');
        expect(editMessageTextMock).toHaveBeenCalledWith('Manga removal cancelled.', { reply_markup: undefined });
        expect(mockedRemoveTrackedManga).not.toHaveBeenCalled();

        expect(loggerWriteSpy).toHaveBeenCalledTimes(1);
        expect(loggerWriteSpy).toHaveBeenLastCalledWith({
          level: 'debug',
          serviceName: 'bot:command:remove',
          msg: 'Entered remove conversation',
        });
      });

      it('should handle user cancelling at confirmation step', async () => {
        const mangaToRemove = trackedMangas[0];
        const callbackDataSelectManga = `remove:${mangaToRemove.id}`;
        const callbackDataCancelConfirm = 'cancel_remove_confirm';

        mockConversationControls.waitFor
          .mockResolvedValueOnce(createMockCallbackQueryContext(callbackDataSelectManga, context.chat?.id, user.telegramId, context.message) as any)
          .mockResolvedValueOnce(createMockCallbackQueryContext(callbackDataCancelConfirm, context.chat?.id, user.telegramId, context.message) as any);

        await removeConversationLogic(mockConversationControls, context, user, trackedMangas);

        const editMessageTextMock = (context as any).editMessageText as jest.Mock;
        const answerCallbackQueryMock = (context as any).answerCallbackQuery as jest.Mock;

        expect(answerCallbackQueryMock).toHaveBeenCalledWith('Removal cancelled.');
        expect(editMessageTextMock).toHaveBeenLastCalledWith(`Ok, "${mangaToRemove.title}" will remain in your tracking list.`, { reply_markup: undefined });
        expect(mockedRemoveTrackedManga).not.toHaveBeenCalled();

        expect(loggerWriteSpy).toHaveBeenCalledTimes(1);
        expect(loggerWriteSpy).toHaveBeenLastCalledWith({
          level: 'debug',
          serviceName: 'bot:command:remove',
          msg: 'Entered remove conversation',
        });
      });

      it('should handle database error when removeTrackedManga fails', async () => {
        mockRemoveTrackedMangaDbError();

        const mangaToRemove = trackedMangas[0];
        const callbackDataSelectManga = `remove:${mangaToRemove.id}`;
        const callbackDataConfirmRemove = `confirm_remove:${mangaToRemove.id}`;

        mockConversationControls.waitFor
          .mockResolvedValueOnce(createMockCallbackQueryContext(callbackDataSelectManga, context.chat?.id, user.telegramId, context.message) as any)
          .mockResolvedValueOnce(createMockCallbackQueryContext(callbackDataConfirmRemove, context.chat?.id, user.telegramId, context.message) as any);

        await removeConversationLogic(mockConversationControls, context, user, trackedMangas);

        const editMessageTextMock = (context as any).editMessageText as jest.Mock;
        const answerCallbackQueryMock = (context as any).answerCallbackQuery as jest.Mock;

        expect(answerCallbackQueryMock).toHaveBeenCalledWith('Error!');
        expect(editMessageTextMock).toHaveBeenLastCalledWith('Could not remove manga tracking due to an error. Please try again later.', { reply_markup: undefined });

        expect(loggerWriteSpy).toHaveBeenCalledTimes(2);
        expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
          level: 'debug',
          serviceName: 'bot:command:remove',
          msg: 'Entered remove conversation',
        });
        expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
          level: 'error',
          serviceName: 'bot:command:remove',
          msg: 'Failed to remove manga tracking',
          error: 'DB error',
          mangaId: 'manga-id-123',
          userId: 'test-user-id',
        });
      });
    });
  });
});
