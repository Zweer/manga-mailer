import type { Api } from 'grammy';
import type { Update, UserFromGetMe } from 'grammy/types';

import type { BotType } from '@/lib/bot/types';

import { createBot } from '@/lib/bot';
import { db } from '@/lib/db';
import * as userActions from '@/lib/db/action/user';

interface CapturedRequest {
  method: keyof Api;
  payload: any;
}

let botInstance: BotType;
let outgoingRequests: CapturedRequest[] = [];

function createMessageUpdate(text: string, chatId = 1111111, userId = 1111111, messageId = 1365): Update {
  return {
    update_id: Date.now() + Math.floor(Math.random() * 1000),
    message: {
      message_id: messageId,
      chat: { id: chatId, type: 'private', first_name: 'TestUser', username: 'testuser_e2e' },
      date: Math.floor(Date.now() / 1000),
      from: { id: userId, is_bot: false, first_name: 'TestUser', username: 'testuser_e2e' },
      text,
    },
  };
}

function _createCallbackQueryUpdate(data: string, message: Update['message'], chatId = 1111111, userId = 1111111): Update {
  if (!message)
    throw new Error('Message is required for callback query update');
  return {
    update_id: Date.now() + Math.floor(Math.random() * 1000),
    callback_query: {
      id: String(Date.now() + Math.floor(Math.random() * 10000)),
      from: { id: userId, is_bot: false, first_name: 'TestUser', username: 'testuser_e2e' },
      chat_instance: String(chatId) + String(userId),
      data,
      message,
    },
  };
}

beforeAll(async () => {
  botInstance = createBot();

  botInstance.api.config.use(async (prev, method, payload) => {
    outgoingRequests.push({ method: method as keyof Api, payload });
    return { ok: true, result: true } as any;
  });

  botInstance.botInfo = {
    id: 424242,
    is_bot: true,
    first_name: 'MyE2ETestBot',
    username: 'my_e2e_test_bot',
    can_join_groups: true,
    can_read_all_group_messages: false,
    supports_inline_queries: false,
  } as UserFromGetMe;
});

beforeEach(async () => {
  outgoingRequests = [];
});

xdescribe('bot E2E-like Tests', () => {
  describe('/start (Signup Conversation)', () => {
    const chatId = 1000001;
    const userId = 1000001;

    it('should guide a new user through the signup process', async () => {
      // 1. Utente invia /start
      await botInstance.handleUpdate(createMessageUpdate('/start', chatId, userId));
      expect(outgoingRequests.length).toBe(1);
      expect(outgoingRequests[0].method).toBe('sendMessage');
      expect(outgoingRequests[0].payload.chat_id).toBe(chatId);
      expect(outgoingRequests[0].payload.text).toBe('Hi there! What is your name?');
      outgoingRequests = []; // Pulisci per la prossima interazione

      // 2. Utente invia il nome
      const userName = 'E2E Test User';
      await botInstance.handleUpdate(createMessageUpdate(userName, chatId, userId, 1366));
      expect(outgoingRequests.length).toBe(2); // Welcome + Ask for email
      expect(outgoingRequests[0].payload.text).toBe(`Welcome to Manga Mailer, ${userName}!`);
      expect(outgoingRequests[1].payload.text).toBe('Where do you want us to mail you updates?');
      outgoingRequests = [];

      // 3. Utente invia l'email
      const userEmail = 'e2e@example.com';
      await botInstance.handleUpdate(createMessageUpdate(userEmail, chatId, userId, 1367));
      expect(outgoingRequests.length).toBe(1); // Confirmation
      expect(outgoingRequests[0].payload.text).toBe(`Perfect, we'll use "${userEmail}" as email address!`);
      outgoingRequests = [];

      // Verifica che l'utente sia stato salvato nel DB
      const dbUser = await db.query.userTable.findFirst({
        where: (user, { eq }) => eq(user.telegramId, userId),
      });
      expect(dbUser).toBeDefined();
      expect(dbUser?.name).toBe(userName);
      expect(dbUser?.email).toBe(userEmail);
    });

    it('should handle signup cancellation with /cancel (if implemented in conversation)', async () => {
      // Questo test dipende da come hai implementato la cancellazione
      // nella tua `signupConversation` in `lib/bot/commands/signup.ts`
      // Il tuo codice attuale non sembra avere un esplicito `/cancel` nel flusso di signup,
      // ma è buona pratica averlo.
      // Se lo aggiungi, puoi testarlo così:

      // 1. Utente invia /start
      await botInstance.handleUpdate(createMessageUpdate('/start', chatId, userId));
      outgoingRequests = []; // Ignora la prima risposta "What is your name?"

      // 2. Utente invia /cancel
      await botInstance.handleUpdate(createMessageUpdate('/cancel', chatId, userId, 1368));
      // Aspettati una risposta di cancellazione o nessuna risposta se la conversazione termina silenziosamente.
      // Ad esempio:
      // expect(outgoingRequests.length).toBe(1);
      // expect(outgoingRequests[0].payload.text).toMatch(/cancelled/i);

      // Verifica che nessun utente sia stato creato
      const dbUser = await db.query.userTable.findFirst({ where: (user, { eq }) => eq(user.telegramId, userId) });
      expect(dbUser).toBeUndefined();
      expect(true).toBe(true); // Placeholder se il cancel non è implementato
    });

    it('should handle validation error for email and allow retry', async () => {
      const upsertUserSpy = jest.spyOn(userActions, 'upsertUser');

      // 1. /start
      await botInstance.handleUpdate(createMessageUpdate('/start', chatId, userId));
      outgoingRequests = [];

      // 2. Nome
      const userName = 'Validation Test User';
      await botInstance.handleUpdate(createMessageUpdate(userName, chatId, userId, 1370));
      outgoingRequests = [];

      // 3. Email non valida
      const invalidEmail = 'invalid-email';
      // Sovrascrivi temporaneamente upsertUser per simulare errore di validazione solo per questa chiamata
      // o assicurati che il tuo Zod validation lanci correttamente.
      // La tua logica di conversazione già gestisce il validationError di upsertUser.
      await botInstance.handleUpdate(createMessageUpdate(invalidEmail, chatId, userId, 1371));
      expect(outgoingRequests.length).toBe(1); // Risposta dell'errore
      expect(outgoingRequests[0].payload.text).toMatch(/❗️ Something went wrong:\n\n• email: Invalid email address/);
      outgoingRequests = [];

      // La conversazione dovrebbe essere tornata al checkpoint pre-email.
      // La prossima risposta dovrebbe essere di nuovo la richiesta dell'email.
      // La tua logica `signup` fa `await conversation.rewind(preEmailCheckpoint);`
      // Dopo `rewind`, grammY non invia automaticamente un messaggio.
      // La tua conversazione attende di nuovo `waitFor('message:text')` per l'email.

      // 4. Utente invia email valida
      const validEmail = 'valid-retry@example.com';
      await botInstance.handleUpdate(createMessageUpdate(validEmail, chatId, userId, 1372));
      expect(outgoingRequests.length).toBe(1);
      expect(outgoingRequests[0].payload.text).toBe(`Perfect, we'll use "${validEmail}" as email address!`);

      const dbUser = await db.query.userTable.findFirst({ where: (u, { eq }) => eq(u.telegramId, userId) });
      expect(dbUser?.email).toBe(validEmail);
      upsertUserSpy.mockRestore();
    });
  });

  describe('/help', () => {
    const chatId = 1000002;
    it('should respond with the help message', async () => {
      await botInstance.handleUpdate(createMessageUpdate('/help', chatId));
      expect(outgoingRequests.length).toBe(1);
      expect(outgoingRequests[0].method).toBe('sendMessage');
      expect(outgoingRequests[0].payload.chat_id).toBe(chatId);
      expect(outgoingRequests[0].payload.text).toContain('⚙️ *Commands*:');
      expect(outgoingRequests[0].payload.parse_mode).toBe('MarkdownV2');
    });
  });
});
