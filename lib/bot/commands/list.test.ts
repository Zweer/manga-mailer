/* eslint-disable ts/unbound-method */
import type { ConversationFlavor } from '@grammyjs/conversations';
import type { CommandContext, Context } from 'grammy';

import type { Bot } from '@/lib/bot';

import { createListConversation } from '@/lib/bot/commands/list';
import { signupConversationId } from '@/lib/bot/constants';
import { listTrackedMangas } from '@/lib/db/action/manga';
import { findUserByTelegramId } from '@/lib/db/action/user';

jest.mock('@/lib/db/action/user', () => ({
  findUserByTelegramId: jest.fn(),
}));
jest.mock('@/lib/db/action/manga', () => ({
  listTrackedMangas: jest.fn(),
}));

const mockedFindUserByTelegramId = findUserByTelegramId as jest.Mock;
const mockedListTrackedMangas = listTrackedMangas as jest.Mock;

type MockContext = CommandContext<Context & ConversationFlavor<Context>>;

function mockCtx(chatId: number): MockContext {
  return {
    chat: { id: chatId, type: 'private' } as any,
    reply: jest.fn().mockResolvedValue(true),
    conversation: {
      enter: jest.fn().mockResolvedValue(undefined),
    } as any,
  } as any;
}

describe('bot Command: /list', () => {
  let listHandler: ((ctx: MockContext) => Promise<void>);
  const mockBotInstance: Partial<Bot> = {
    command: jest.fn((commandName, handler) => {
      if (commandName === 'list') {
        listHandler = handler;
      }
    }) as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    createListConversation(mockBotInstance as Bot);
    // eslint-disable-next-line ts/strict-boolean-expressions
    if (!listHandler) {
      throw new Error('/list handler not registered by createListConversation');
    }
  });

  it('should prompt user to signup if user is not found', async () => {
    const currentChatId = 1234;
    const currentCtx = mockCtx(currentChatId);
    mockedFindUserByTelegramId.mockResolvedValue(undefined);

    await listHandler(currentCtx);

    expect(mockedFindUserByTelegramId).toHaveBeenCalledWith(currentChatId);
    expect(currentCtx.conversation?.enter).toHaveBeenCalledWith(signupConversationId);
    expect(currentCtx.reply).not.toHaveBeenCalled();
  });

  it('should inform user if they are tracking no mangas', async () => {
    const currentChatId = 5678;
    const currentCtx = mockCtx(currentChatId);
    const mockUser = { id: 'user-test-id-list', name: 'Test User', telegramId: currentChatId, email: 'u@e.com' };

    mockedFindUserByTelegramId.mockResolvedValue(mockUser);
    mockedListTrackedMangas.mockResolvedValue([]);

    await listHandler(currentCtx);

    expect(mockedFindUserByTelegramId).toHaveBeenCalledWith(currentChatId);
    expect(mockedListTrackedMangas).toHaveBeenCalledWith(mockUser.id);
    expect(currentCtx.reply).toHaveBeenCalledWith('You\'re not tracking any manga yet: tap /track to track your first manga');
    expect(currentCtx.conversation?.enter).not.toHaveBeenCalled();
  });

  it('should list tracked mangas if user and mangas exist', async () => {
    const currentChatId = 9101;
    const currentCtx = mockCtx(currentChatId);
    const mockUser = { id: 'user-test-id-list-2', name: 'Test User 2', telegramId: currentChatId, email: 'u2@e.com' };
    const trackedMangas = [
      { title: 'Manga Alpha', chaptersCount: 10 },
      { title: 'Manga Beta', chaptersCount: 25 },
    ];

    mockedFindUserByTelegramId.mockResolvedValue(mockUser);
    mockedListTrackedMangas.mockResolvedValue(trackedMangas);

    await listHandler(currentCtx);

    expect(mockedFindUserByTelegramId).toHaveBeenCalledWith(currentChatId);
    expect(mockedListTrackedMangas).toHaveBeenCalledWith(mockUser.id);

    const expectedReplyMessage = `Here is what you're currently tracking:\n\n${
      trackedMangas.map(manga => `• ${manga.title} (${manga.chaptersCount})`).join('\n')
    }`;
    expect(currentCtx.reply).toHaveBeenCalledWith(expectedReplyMessage);
    expect(currentCtx.conversation?.enter).not.toHaveBeenCalled();
  });
});
