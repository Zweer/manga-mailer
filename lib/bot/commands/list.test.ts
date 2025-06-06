/* eslint-disable ts/unbound-method */
import type { CommandContext } from 'grammy';

import type { BotContext, BotType } from '@/lib/bot/types';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createListConversation } from '@/lib/bot/commands/list';
import { loggerWriteSpy } from '@/test/log';
import { createMockCommandContext } from '@/test/mocks/bot/context';
import { mockedListTrackedMangas, mockListTrackedMangasSuccess } from '@/test/mocks/db/manga';
import { mockedFindUserByTelegramId, mockFindUserByTelegramIdNotFound, mockFindUserByTelegramIdSuccess } from '@/test/mocks/db/user';

vi.mock('@/lib/db/action/manga', () => ({
  listTrackedMangas: vi.fn(),
  removeTrackedManga: vi.fn(),
  trackManga: vi.fn(),
}));
vi.mock('@/lib/db/action/user', () => ({
  findUserByTelegramId: vi.fn(),
  upsertUser: vi.fn(),
}));

describe('bot -> commands -> list', () => {
  let listHandler: ((ctx: CommandContext<BotContext>) => Promise<void>);
  const mockBotInstance: Partial<BotType> = {
    command: vi.fn((commandName, handler) => {
      if (commandName === 'list') {
        listHandler = handler;
      }
    }) as any,
  };

  beforeEach(() => {
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
    const context = createMockCommandContext('/list');
    mockFindUserByTelegramIdNotFound();

    await listHandler(context);

    expect(mockedFindUserByTelegramId).toHaveBeenCalledWith(context.from?.id);
    expect(context.reply).toHaveBeenCalledTimes(1);
    expect(context.reply).toHaveBeenLastCalledWith('You need to /start and register before you can remove manga.');

    expect(loggerWriteSpy).toHaveBeenCalledTimes(1);
    expect(loggerWriteSpy).toHaveBeenLastCalledWith({
      level: 'debug',
      serviceName: 'bot:command:list',
      msg: 'Received /list command',
      userId: context.from?.id,
    });
  });

  it('should inform user if they are tracking no mangas', async () => {
    const context = createMockCommandContext('/list');

    const user = mockFindUserByTelegramIdSuccess();
    mockListTrackedMangasSuccess([]);

    await listHandler(context);

    expect(mockedFindUserByTelegramId).toHaveBeenCalledWith(context.from?.id);
    expect(mockedListTrackedMangas).toHaveBeenCalledWith(user.id);
    expect(context.reply).toHaveBeenCalledWith('You\'re not tracking any manga yet: tap /track to track your first manga');
    expect(context.conversation.enter).not.toHaveBeenCalled();

    expect(loggerWriteSpy).toHaveBeenCalledTimes(1);
    expect(loggerWriteSpy).toHaveBeenLastCalledWith({
      level: 'debug',
      serviceName: 'bot:command:list',
      msg: 'Received /list command',
      userId: context.from?.id,
    });
  });

  it('should list tracked mangas if user and mangas exist', async () => {
    const context = createMockCommandContext('/list');
    const trackedMangas = [
      { title: 'Manga Alpha', chaptersCount: 10 },
      { title: 'Manga Beta', chaptersCount: 25 },
    ];

    const user = mockFindUserByTelegramIdSuccess();
    mockListTrackedMangasSuccess(trackedMangas);

    await listHandler(context);

    expect(mockedFindUserByTelegramId).toHaveBeenCalledWith(context.from?.id);
    expect(mockedListTrackedMangas).toHaveBeenCalledWith(user.id);

    const expectedReplyMessage = `Here is what you're currently tracking:\n\n${
      trackedMangas.map(manga => `• ${manga.title} (${manga.chaptersCount})`).join('\n')
    }`;
    expect(context.reply).toHaveBeenCalledWith(expectedReplyMessage);
    expect(context.conversation.enter).not.toHaveBeenCalled();

    expect(loggerWriteSpy).toHaveBeenCalledTimes(2);
    expect(loggerWriteSpy).toHaveBeenLastCalledWith({
      level: 'debug',
      serviceName: 'bot:command:list',
      userId: context.from?.id,
      trackedMangas: 2,
    });
  });
});
