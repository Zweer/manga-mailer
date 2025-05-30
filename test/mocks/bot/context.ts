/* eslint-disable ts/no-unsafe-call */
/* eslint-disable ts/no-unsafe-return */
import type { Conversation, ConversationControls } from '@grammyjs/conversations';
import type { Api, CallbackQueryContext, CommandContext, RawApi } from 'grammy';
import type { Message } from 'grammy/types';

import type { BotContext } from '@/lib/bot/types';

export type MockMessageContext = BotContext;
export type MockCommandContext = CommandContext<BotContext>;
export type MockCallbackQueryContext = CallbackQueryContext<BotContext>;

function createBaseMockContext(chatId: number, userId: number): Partial<BotContext> {
  return {
    chat: { id: chatId, type: 'private', first_name: 'Test', username: 'testuser' },
    from: { id: userId, is_bot: false, first_name: 'Test', username: 'testuser' },
    reply: jest.fn().mockResolvedValue(true),
    conversation: {
      enter: jest.fn().mockResolvedValue(undefined),
      exit: jest.fn().mockResolvedValue(undefined),
      active: jest.fn().mockReturnValue({}),
      waitFor: jest.fn(),
      external: jest.fn(async callback => callback()),
      checkpoint: jest.fn(),
      rewind: jest.fn().mockResolvedValue(undefined),
    } as unknown as ConversationControls,
    api: {
      raw: jest.fn().mockResolvedValue({ ok: true, result: true }),
      call: jest.fn().mockResolvedValue({ ok: true, result: true }),
    } as unknown as Api<RawApi>,
    answerCallbackQuery: jest.fn().mockResolvedValue(true),
    editMessageText: jest.fn().mockResolvedValue(true),
    editMessageReplyMarkup: jest.fn().mockResolvedValue(true),
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
    answerCallbackQuery: jest.fn().mockResolvedValue(true),
    editMessageText: jest.fn().mockResolvedValue(true),
  } as MockCallbackQueryContext;
}

export function createMockConversationControl(): jest.Mocked<Conversation> {
  return {
    waitFor: jest.fn(),
    external: jest.fn(async (callback: () => any) => callback()),
    checkpoint: jest.fn(),
    rewind: jest.fn().mockResolvedValue(undefined),
    log: jest.fn(),
    skip: jest.fn(),
    wait: jest.fn().mockResolvedValue(undefined),
  } as any;
}
