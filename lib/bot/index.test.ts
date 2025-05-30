import type { MockMessageContext } from '@/test/mocks/bot/context';

import * as conversacionesPlugin from '@grammyjs/conversations';

import * as helpCommand from '@/lib/bot/commands/help';
import * as listCommand from '@/lib/bot/commands/list';
import * as signupCommand from '@/lib/bot/commands/signup';
import * as trackCommand from '@/lib/bot/commands/track';
import { createBot } from '@/lib/bot/index';
import { Bot } from '@/lib/bot/types';
import { createMockMessageContext } from '@/test/mocks/bot/context';

const mockBotInstance = {
  use: jest.fn().mockReturnThis(),
  command: jest.fn().mockReturnThis(),
  on: jest.fn().mockReturnThis(),
  api: {},
};

jest.mock('@/lib/bot/types', () => ({
  Bot: jest.fn().mockImplementation(() => mockBotInstance),
}));

jest.mock('@grammyjs/conversations', () => ({
  conversations: jest.fn(() => ({ type: 'conversations-plugin' })),
  createConversation: jest.fn(),
}));
jest.mock('@/lib/bot/commands/help', () => ({
  createHelpMessage: jest.fn(),
}));
jest.mock('@/lib/bot/commands/list', () => ({
  createListConversation: jest.fn(),
}));
jest.mock('@/lib/bot/commands/signup', () => ({
  createSignupConversation: jest.fn(),
}));
jest.mock('@/lib/bot/commands/track', () => ({
  createTrackConversation: jest.fn(),
}));

describe('bot Core Logic (lib/bot/index.ts)', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalTelegramToken = process.env.TELEGRAM_TOKEN;

  beforeEach(() => {
    jest.clearAllMocks();

    // @ts-expect-error node env is not readonly
    process.env.NODE_ENV = originalNodeEnv;
    process.env.TELEGRAM_TOKEN = originalTelegramToken;
  });

  afterAll(() => {
    // @ts-expect-error node env is not readonly
    process.env.NODE_ENV = originalNodeEnv;
    process.env.TELEGRAM_TOKEN = originalTelegramToken;
  });

  describe('createBot', () => {
    it('should create a Bot instance with test token in test environment', () => {
    // @ts-expect-error node env is not readonly
      process.env.NODE_ENV = 'test';
      createBot(false);
      expect(Bot).toHaveBeenCalledWith('test');
    });

    it('should create a Bot instance with env token in non-test environment', () => {
    // @ts-expect-error node env is not readonly
      process.env.NODE_ENV = 'development';
      process.env.TELEGRAM_TOKEN = 'env-token-123';
      createBot(false);
      expect(Bot).toHaveBeenCalledWith('env-token-123');
    });

    describe('when doInit is true (default)', () => {
      beforeEach(() => {
        createBot(true);
      });

      it('should use the conversations plugin', () => {
        expect(conversacionesPlugin.conversations).toHaveBeenCalledTimes(1);
        expect(mockBotInstance.use).toHaveBeenCalledWith(expect.objectContaining({ type: 'conversations-plugin' }));
      });

      it('should register all command and conversation handlers', () => {
        expect(helpCommand.createHelpMessage).toHaveBeenCalledWith(mockBotInstance);
        expect(listCommand.createListConversation).toHaveBeenCalledWith(mockBotInstance);
        expect(signupCommand.createSignupConversation).toHaveBeenCalledWith(mockBotInstance);
        expect(trackCommand.createTrackConversation).toHaveBeenCalledWith(mockBotInstance);
      });

      it('should register the generic message handler', () => {
        expect(mockBotInstance.on).toHaveBeenCalledWith('message', expect.any(Function));
      });
    });

    describe('when doInit is false', () => {
      beforeEach(() => {
        createBot(false);
      });

      it('should NOT use the conversations plugin', () => {
        expect(conversacionesPlugin.conversations).not.toHaveBeenCalled();
      });

      it('should NOT register command and conversation handlers', () => {
        expect(helpCommand.createHelpMessage).not.toHaveBeenCalled();
        expect(listCommand.createListConversation).not.toHaveBeenCalled();
        expect(signupCommand.createSignupConversation).not.toHaveBeenCalled();
        expect(trackCommand.createTrackConversation).not.toHaveBeenCalled();
      });

      it('should still register the generic message handler', () => {
        expect(mockBotInstance.on).toHaveBeenCalledWith('message', expect.any(Function));
      });
    });
  });

  describe('generic Message Handler (bot.on("message", ...))', () => {
    it('should reply with fallback message for unhandled messages', async () => {
      createBot(false);
      const messageOnArgs = mockBotInstance.on.mock.calls.find(
        // eslint-disable-next-line ts/no-unsafe-function-type
        (callArgs: [string, Function]) => callArgs[0] === 'message',
      );

      expect(messageOnArgs).toBeDefined();
      const messageHandler = messageOnArgs[1] as (ctx: MockMessageContext) => Promise<void>;

      const chatId = 6001;
      const ctx = createMockMessageContext('unhandled random text', chatId);

      await messageHandler(ctx);

      // eslint-disable-next-line ts/unbound-method
      expect(ctx.reply).toHaveBeenCalledWith('❗️ I don\'t understand... tap /help to see the list of commands that you can use.');
    });
  });
});
