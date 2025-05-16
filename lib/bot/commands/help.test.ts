import type { CommandContext } from 'grammy';

import type { BotContext, BotType } from '@/lib/bot/types';

import { createHelpMessage } from '@/lib/bot/commands/help';
import { createMockCommandContext } from '@/test/utils/contextMock';

describe('bot -> commands -> help', () => {
  let helpHandler: ((ctx: CommandContext<BotContext>) => Promise<void>);

  const mockBotInstance: Partial<BotType> = {
    command: jest.fn((commandName, handler) => {
      if (commandName === 'help') {
        helpHandler = handler;
      }
    }) as any,
  };

  beforeEach(() => {
    createHelpMessage(mockBotInstance as BotType);
    // eslint-disable-next-line ts/strict-boolean-expressions
    if (!helpHandler) {
      throw new Error('Help handler was not registered');
    }
  });

  it('should register a "help" command handler on the bot', () => {
    expect(mockBotInstance.command).toHaveBeenCalledWith('help', expect.any(Function));
  });

  it('should reply with a formatted list of commands when the /help handler is invoked', async () => {
    const currentCtx = createMockCommandContext('/help', 1000);

    expect(helpHandler).toBeDefined();

    await helpHandler(currentCtx);

    const exppectedHelpMessage = `⚙️ *Commands*:

• /start \\- Signup to the bot, providing name and email address
• /track \\- Track a new manga
• /list \\- List all the manga you are tracking
• /remove \\- Remove a tracked manga`;
    expect(currentCtx.reply).toHaveBeenCalledWith(exppectedHelpMessage, { parse_mode: 'MarkdownV2' });
  });
});
