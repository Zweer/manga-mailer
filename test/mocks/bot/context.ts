/* eslint-disable ts/no-unsafe-call */
/* eslint-disable ts/no-unsafe-return */
import type { Conversation, ConversationControls } from '@grammyjs/conversations';
import type { Api, CallbackQueryContext, CommandContext, RawApi } from 'grammy';
import type { Message } from 'grammy/types';
import type { Mocked } from 'vitest';

import type { BotContext } from '@/lib/bot/types';

import { vi } from 'vitest';

export type MockMessageContext = BotContext;
export type MockCommandContext = CommandContext<BotContext>;
export type MockCallbackQueryContext = CallbackQueryContext<BotContext>;

function createBaseMockContext(chatId: number, userId: number): Partial<BotContext> {
  return {
    chat: { id: chatId, type: 'private', first_name: 'Test', username: 'testuser' },
    from: { id: userId, is_bot: false, first_name: 'Test', username: 'testuser' },
    reply: vi.fn().mockResolvedValue(true),
    conversation: {
      enter: vi.fn().mockResolvedValue(undefined),
      exit: vi.fn().mockResolvedValue(undefined),
      active: vi.fn().mockReturnValue({}),
      waitFor: vi.fn(),
      external: vi.fn(async callback => callback()),
      checkpoint: vi.fn(),
      rewind: vi.fn().mockResolvedValue(undefined),
    } as unknown as ConversationControls,
    api: {
      raw: vi.fn().mockResolvedValue({ ok: true, result: true }),
      call: vi.fn().mockResolvedValue({ ok: true, result: true }),
    } as unknown as Api<RawApi>,
    answerCallbackQuery: vi.fn().mockResolvedValue(true),
    editMessageText: vi.fn().mockResolvedValue(true),
    editMessageReplyMarkup: vi.fn().mockResolvedValue(true),
  };
}

export function createMockMessageContext(
  text: string,
  chatId = 12345,
  userId = 123456789,
  messageId = Date.now(),
): MockMessageContext {
  const baseCtx = createBaseMockContext(chatId, userId);
  return {
    ...baseCtx,
    message: {
      message_id: messageId,
      chat: baseCtx.chat,
      date: Math.floor(Date.now() / 1000),
      from: baseCtx.from,
      text,
    },
    from: baseCtx.from,
    chat: baseCtx.chat,
  } as MockMessageContext;
}

export function createMockCommandContext(
  command: string,
  chatId = 12345,
  userId = 123456789,
  messageId = Date.now(),
): MockCommandContext {
  const context = createMockMessageContext(command, chatId, userId, messageId);

  context.message!.entities = [{ type: 'bot_command', offset: 0, length: command.length }];
  context.match = '';

  return context as MockCommandContext;
}

export function createMockCallbackQueryContext(
  data: string,
  chatId = 12345,
  userId = 123456789,
  message?: Message,
): MockCallbackQueryContext {
  const baseCtx = createBaseMockContext(chatId, userId);
  const effectiveUserId = userId ?? chatId;

  const originalMessage = message ?? {
    message_id: Date.now() - 1000,
    chat: baseCtx.chat,
    date: Math.floor(Date.now() / 1000) - 10,
    text: 'Message with inline keyboard',
    from: { id: 12345678, is_bot: true, first_name: 'TestBot' },
  };

  return {
    ...baseCtx,
    callbackQuery: {
      id: String(Date.now()),
      from: baseCtx.from,
      chat_instance: String(chatId) + String(effectiveUserId),
      data,
      message: originalMessage,
    },
    from: baseCtx.from,
    chat: baseCtx.chat,
    answerCallbackQuery: vi.fn().mockResolvedValue(true),
    editMessageText: vi.fn().mockResolvedValue(true),
  } as MockCallbackQueryContext;
}

export function createMockConversationControl(): Mocked<Conversation> {
  return {
    waitFor: vi.fn(),
    external: vi.fn(async (callback: () => any) => callback()),
    checkpoint: vi.fn(),
    rewind: vi.fn().mockResolvedValue(undefined),
    log: vi.fn(),
    skip: vi.fn(),
    wait: vi.fn().mockResolvedValue(undefined),
  } as any;
}
