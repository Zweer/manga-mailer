/* eslint-disable ts/unbound-method */
import type { Conversation } from '@grammyjs/conversations';

import type { BotContext, BotType } from '@/lib/bot/types';
import type {
  MockCommandContext,
} from '@/test/utils/contextMock';

import { createSignupConversation, signupConversationLogic } from '@/lib/bot/commands/signup';
import { signupConversationId } from '@/lib/bot/constants';
import * as userActions from '@/lib/db/action/user';
import {
  createMockCommandContext,
  createMockMessageContext,
} from '@/test/utils/contextMock';

jest.mock('@/lib/db/action/user');

const mockedUpsertUser = userActions.upsertUser as jest.Mock;

describe('bot -> commands -> signup', () => {
  let startCommandHandler: ((ctx: MockCommandContext) => Promise<void>);

  const mockBotInstance: Partial<BotType> = {
    command: jest.fn((commandName, handler) => {
      if (commandName === 'start') {
        startCommandHandler = handler;
      }
    }) as any,
    use: jest.fn().mockReturnThis(),
  };

  beforeAll(() => {
    createSignupConversation(mockBotInstance as BotType);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // eslint-disable-next-line ts/strict-boolean-expressions
    if (!startCommandHandler) {
      throw new Error('/start command handler not registered');
    }
  });

  describe('command Handler: /start', () => {
    it('should enter signupConversation', async () => {
      const chatId = 4001;
      const ctx = createMockCommandContext('/start', chatId);

      await startCommandHandler(ctx);

      expect(ctx.conversation.enter).toHaveBeenCalledWith(signupConversationId);
    });
  });

  describe('conversation Logic: signupConversationLogic', () => {
    const testChatId = 5001;
    const testUserId = 5001;

    let mockConversationControls: jest.Mocked<Conversation>;
    let currentCtx: BotContext;

    beforeEach(() => {
      mockConversationControls = {
        waitFor: jest.fn(),
        external: jest.fn(async (callback: () => any) => callback()),
        checkpoint: jest.fn(),
        rewind: jest.fn().mockResolvedValue(undefined),
        log: jest.fn(),
        skip: jest.fn(),
        wait: jest.fn().mockResolvedValue(undefined),
        session: {} as any,
        __flavor: undefined as any,
      } as any;

      currentCtx = createMockMessageContext('', testChatId, testUserId);
    });

    it('happy Path: should guide user, collect name and email, and save user', async () => {
      const userName = 'Test Signup User';
      const userEmail = 'signup@example.com';

      mockConversationControls.waitFor
        .mockResolvedValueOnce(createMockMessageContext(userName, testChatId, testUserId) as any)
        .mockResolvedValueOnce(createMockMessageContext(userEmail, testChatId, testUserId) as any);

      mockedUpsertUser.mockResolvedValue({ success: true });
      await signupConversationLogic(mockConversationControls, currentCtx);

      const replyMock = currentCtx.reply as jest.Mock;
      expect(replyMock).toHaveBeenNthCalledWith(1, 'Hi there! What is your name?');
      expect(replyMock).toHaveBeenNthCalledWith(2, `Welcome to Manga Mailer, ${userName}!`);
      expect(replyMock).toHaveBeenNthCalledWith(3, 'Where do you want us to mail you updates?');
      expect(replyMock).toHaveBeenNthCalledWith(4, `Perfect, we'll use "${userEmail}" as email address!`);

      expect(mockedUpsertUser).toHaveBeenCalledWith({
        telegramId: testChatId,
        name: userName,
        email: userEmail,
      });
    });

    it('should handle /cancel when waiting for email', async () => {
      const userName = 'User Cancels';
      mockConversationControls.waitFor
        .mockResolvedValueOnce(createMockMessageContext(userName, testChatId, testUserId) as any)
        .mockResolvedValueOnce(createMockMessageContext('/cancel', testChatId, testUserId) as any);

      await signupConversationLogic(mockConversationControls, currentCtx);

      const replyMock = currentCtx.reply as jest.Mock;
      expect(replyMock).toHaveBeenCalledTimes(3);
      expect(mockedUpsertUser).not.toHaveBeenCalled();
      expect(mockConversationControls.rewind).not.toHaveBeenCalled();
    });

    it('should handle validationError from upsertUser and rewind', async () => {
      const userName = 'Validation Error User';
      const userEmail = 'invalidformat';
      const validationErrorPayload = [{ field: 'email', error: 'Invalid email address' }];

      mockConversationControls.waitFor
        .mockResolvedValueOnce(createMockMessageContext(userName, testChatId, testUserId) as any)
        .mockResolvedValueOnce(createMockMessageContext(userEmail, testChatId, testUserId) as any);

      mockedUpsertUser.mockResolvedValue({ success: false, validationError: validationErrorPayload });

      await signupConversationLogic(mockConversationControls, currentCtx);

      const replyMock = currentCtx.reply as jest.Mock;
      expect(replyMock).toHaveBeenLastCalledWith(`❗️ Something went wrong:\n\n• email: Invalid email address`);
      expect(mockConversationControls.checkpoint).toHaveBeenCalledTimes(1);
      expect(mockConversationControls.rewind).toHaveBeenCalledTimes(1);
    });

    it('should handle databaseError from upsertUser and terminate', async () => {
      const userName = 'DB Error User';
      const userEmail = 'db.error@example.com';
      const dbErrorMsg = 'Connection failed';

      mockConversationControls.waitFor
        .mockResolvedValueOnce(createMockMessageContext(userName, testChatId, testUserId) as any)
        .mockResolvedValueOnce(createMockMessageContext(userEmail, testChatId, testUserId) as any);

      mockedUpsertUser.mockResolvedValue({ success: false, databaseError: dbErrorMsg });

      await signupConversationLogic(mockConversationControls, currentCtx);

      const replyMock = currentCtx.reply as jest.Mock;
      expect(replyMock).toHaveBeenLastCalledWith('❗️ Something went wrong, please try again later');
      expect(mockConversationControls.rewind).not.toHaveBeenCalled();
    });
  });
});
