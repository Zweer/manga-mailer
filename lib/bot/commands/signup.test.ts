/* eslint-disable ts/unbound-method */
import type { BotType } from '@/lib/bot/types';
import type { MockCommandContext } from '@/test/mocks/bot/context';

import { createSignupConversation, signupConversationLogic } from '@/lib/bot/commands/signup';
import { signupConversationId } from '@/lib/bot/constants';
import { loggerWriteSpy } from '@/test/log';
import { createMockCommandContext, createMockConversationControl, createMockMessageContext } from '@/test/mocks/bot/context';
import { mockedUpsertUser, mockUpsertUserSuccess } from '@/test/mocks/db/user';

jest.mock('@/lib/db/action/user', () => ({
  findUserByTelegramId: jest.fn(),
  upsertUser: jest.fn(),
}));

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

  beforeEach(() => {
    createSignupConversation(mockBotInstance as BotType);
    // eslint-disable-next-line ts/strict-boolean-expressions
    if (!startCommandHandler) {
      throw new Error('/start command handler not registered');
    }
  });

  it('should register a "start" command handler on the bot', () => {
    expect(mockBotInstance.command).toHaveBeenCalledWith('start', expect.any(Function));
  });

  describe('command Handler: /start', () => {
    it('should enter signupConversation', async () => {
      const context = createMockCommandContext('/start');

      await startCommandHandler(context);

      expect(context.conversation.enter).toHaveBeenCalledWith(signupConversationId);

      expect(loggerWriteSpy).toHaveBeenCalledTimes(1);
      expect(loggerWriteSpy).toHaveBeenLastCalledWith({
        level: 'debug',
        serviceName: 'bot:command:signup',
        msg: 'Received /start command',
        userId: context.from?.id,
      });
    });
  });

  describe('conversation Logic: signupConversationLogic', () => {
    const mockConversationControls = createMockConversationControl();
    const conversationContext = createMockMessageContext('');

    it('happy Path: should guide user, collect name and email, and save user', async () => {
      const userName = 'Test Signup User';
      const userEmail = 'signup@example.com';

      mockConversationControls.waitFor
        .mockResolvedValueOnce(createMockMessageContext(userName) as any)
        .mockResolvedValueOnce(createMockMessageContext(userEmail) as any);

      mockUpsertUserSuccess();
      await signupConversationLogic(mockConversationControls, conversationContext);

      const replyMock = conversationContext.reply as jest.Mock;
      expect(replyMock).toHaveBeenNthCalledWith(1, 'Hi there! What is your name?');
      expect(replyMock).toHaveBeenNthCalledWith(2, `Welcome to Manga Mailer, ${userName}!`);
      expect(replyMock).toHaveBeenNthCalledWith(3, 'Where do you want us to mail you updates?');
      expect(replyMock).toHaveBeenNthCalledWith(4, `Perfect, we'll use "${userEmail}" as email address!`);

      expect(mockedUpsertUser).toHaveBeenCalledWith({
        telegramId: conversationContext.from!.id,
        name: userName,
        email: userEmail,
      });

      expect(loggerWriteSpy).toHaveBeenCalledTimes(4);
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
        level: 'debug',
        serviceName: 'bot:command:signup',
        msg: 'Entered signup conversation',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
        level: 'debug',
        serviceName: 'bot:command:signup',
        msg: 'Received name: "Test Signup User"',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
        level: 'debug',
        serviceName: 'bot:command:signup',
        msg: 'Received email: "signup@example.com"',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(4, {
        level: 'debug',
        serviceName: 'bot:command:signup',
        msg: 'User saved',
        email: 'signup@example.com',
        name: 'Test Signup User',
        telegramId: 123456789,
      });
    });

    it('should handle /cancel when waiting for email', async () => {
      const userName = 'User Cancels';
      mockConversationControls.waitFor
        .mockResolvedValueOnce(createMockMessageContext(userName) as any)
        .mockResolvedValueOnce(createMockMessageContext('/cancel') as any);

      await signupConversationLogic(mockConversationControls, conversationContext);

      const replyMock = conversationContext.reply as jest.Mock;
      expect(replyMock).toHaveBeenCalledTimes(3);
      expect(mockedUpsertUser).not.toHaveBeenCalled();
      expect(mockConversationControls.rewind).not.toHaveBeenCalled();

      expect(loggerWriteSpy).toHaveBeenCalledTimes(2);
      expect(loggerWriteSpy).toHaveBeenLastCalledWith({
        level: 'debug',
        serviceName: 'bot:command:signup',
        msg: 'Received name: "User Cancels"',
      });
    });

    it('should handle validationError from upsertUser and rewind', async () => {
      const userName = 'Validation Error User';
      const userEmail = 'invalidformat';
      const validationErrorPayload = [{ field: 'email', error: 'Invalid email address' }];

      mockConversationControls.waitFor
        .mockResolvedValueOnce(createMockMessageContext(userName) as any)
        .mockResolvedValueOnce(createMockMessageContext(userEmail) as any);

      mockedUpsertUser.mockResolvedValue({ success: false, validationErrors: validationErrorPayload });

      await signupConversationLogic(mockConversationControls, conversationContext);

      const replyMock = conversationContext.reply as jest.Mock;
      expect(replyMock).toHaveBeenLastCalledWith(`❗️ Something went wrong:\n\n• email: Invalid email address`);
      expect(mockConversationControls.checkpoint).toHaveBeenCalledTimes(1);
      expect(mockConversationControls.rewind).toHaveBeenCalledTimes(1);

      expect(loggerWriteSpy).toHaveBeenCalledTimes(4);
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
        level: 'debug',
        serviceName: 'bot:command:signup',
        msg: 'Received email: "invalidformat"',
      });
      expect(loggerWriteSpy).toHaveBeenLastCalledWith({
        level: 'error',
        serviceName: 'bot:command:signup',
        msg: 'Validation error',
        errors: [{
          error: 'Invalid email address',
          field: 'email',
        }],
      });
    });

    it('should handle databaseError from upsertUser and terminate', async () => {
      const userName = 'DB Error User';
      const userEmail = 'db.error@example.com';
      const dbErrorMsg = 'Connection failed';

      mockConversationControls.waitFor
        .mockResolvedValueOnce(createMockMessageContext(userName) as any)
        .mockResolvedValueOnce(createMockMessageContext(userEmail) as any);

      mockedUpsertUser.mockResolvedValue({ success: false, databaseError: dbErrorMsg });

      await signupConversationLogic(mockConversationControls, conversationContext);

      const replyMock = conversationContext.reply as jest.Mock;
      expect(replyMock).toHaveBeenLastCalledWith('❗️ Something went wrong, please try again later');
      expect(mockConversationControls.rewind).not.toHaveBeenCalled();

      expect(loggerWriteSpy).toHaveBeenCalledTimes(4);
      expect(loggerWriteSpy).toHaveBeenLastCalledWith({
        level: 'error',
        serviceName: 'bot:command:signup',
        msg: 'Database error',
        errors: ['Connection failed'],
      });
    });
  });
});
