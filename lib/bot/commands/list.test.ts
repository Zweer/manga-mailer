/* eslint-disable ts/unbound-method */
import type { CommandContext } from 'grammy';

import type { BotContext, BotType } from '@/lib/bot/types';

import { createListConversation } from '@/lib/bot/commands/list';
import { signupConversationId } from '@/lib/bot/constants';
import { listTrackedMangas } from '@/lib/db/action/manga';
import { findUserByTelegramId } from '@/lib/db/action/user';
import { createMockCommandContext } from '@/test/utils/contextMock';

jest.mock('@/lib/db/action/user', () => ({
  findUserByTelegramId: jest.fn(),
}));
jest.mock('@/lib/db/action/manga', () => ({
  listTrackedMangas: jest.fn(),
}));

const mockedFindUserByTelegramId = findUserByTelegramId as jest.Mock;
const mockedListTrackedMangas = listTrackedMangas as jest.Mock;

describe('bot -> commands -> list', () => {
  let listHandler: ((ctx: CommandContext<BotContext>) => Promise<void>);
  const mockBotInstance: Partial<BotType> = {
    command: jest.fn((commandName, handler) => {
      if (commandName === 'list') {
        listHandler = handler;
      }
    }) as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    createListConversation(mockBotInstance as BotType);
    // eslint-disable-next-line ts/strict-boolean-expressions
    if (!listHandler) {
      throw new Error('List handler was not registered');
    }
  });

  it('should register a "list" command handler on the bot', () => {
    expect(mockBotInstance.command).toHaveBeenCalledWith('list', expect.any(Function));
  });

  it('should prompt user to signup if user is not found', async () => {
    const currentChatId = 1234;
    const currentCtx = createMockCommandContext('/list', currentChatId);
    mockedFindUserByTelegramId.mockResolvedValue(undefined);

    await listHandler(currentCtx);

    expect(mockedFindUserByTelegramId).toHaveBeenCalledWith(currentChatId);
    expect(currentCtx.conversation.enter).toHaveBeenCalledWith(signupConversationId);
    expect(currentCtx.reply).not.toHaveBeenCalled();
  });

  it('should inform user if they are tracking no mangas', async () => {
    const currentChatId = 5678;
    const currentCtx = createMockCommandContext('/list', currentChatId);
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
    const currentCtx = createMockCommandContext('/list', currentChatId);
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
