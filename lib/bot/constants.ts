import type { BotCommand } from 'grammy/types';

export const commands: BotCommand[] = [
  { command: 'start', description: 'Signup to the bot, providing name and email address' },
  { command: 'track', description: 'Track a new manga' },
  { command: 'list', description: 'List all the manga you are tracking' },
  { command: 'remove', description: 'Remove a tracked manga' },
];

export const startConversationId = 'start';
export const trackConversationId = 'track';
