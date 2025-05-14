import type { CommandContext, Context } from 'grammy';

import type { Bot } from '@/lib/bot';

import { createHelpMessage } from '@/lib/bot/commands/help';
import { commands } from '@/lib/bot/constants';

function mockCtx(messageText = '/help'): Partial<CommandContext<Context>> {
  return {
    message: {
      message_id: 123,
      chat: { id: 1000, type: 'private' } as any,
      date: Date.now() / 1000,
      text: messageText,
    } as any,
    chat: { id: 1000, type: 'private' } as any,
    reply: jest.fn().mockResolvedValue(true),
  };
}

describe('bot -> commands -> help', () => {
  it('should register a "help" command handler on the bot', () => {
    const mockBotInstance: Partial<Bot> = {
      command: jest.fn(),
    };

    createHelpMessage(mockBotInstance as Bot);

    expect(mockBotInstance.command).toHaveBeenCalledWith('help', expect.any(Function));
  });

  it('should reply with a formatted list of commands when the /help handler is invoked', async () => {
    const currentCtx = mockCtx() as CommandContext<Context>;
    let helpHandler: ((ctx: CommandContext<Context>) => Promise<void>) | undefined;

    const mockBotInstance: Partial<Bot> = {
      command: jest.fn((commandName, handler) => {
        if (commandName === 'help') {
          helpHandler = handler;
        }
      }) as any,
    };

    createHelpMessage(mockBotInstance as Bot);

    expect(helpHandler).toBeDefined();
    if (!helpHandler) {
      throw new Error('Help handler was not registered');
    }

    await helpHandler(currentCtx);

    const commandDescriptions = commands.map(({ command, description }) => `• /${command} \\- ${description}`).join('\n');
    const expectedReplyMessage = `⚙️ *Commands*:\n\n${commandDescriptions}`;

    expect(currentCtx.reply).toHaveBeenCalledWith(expectedReplyMessage, { parse_mode: 'MarkdownV2' });
  });
});
