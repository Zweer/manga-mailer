# File export

.editorconfig:

```editorconfig
# http://editorconfig.org/
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
```

---

.gitignore:

```gitignore
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# env files (can opt-in for commiting if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

```

---

.vscode/settings.json:

```json
{
  "conventionalCommits.scopes": [
    "bot",
    "database"
  ]
}
```

---

app/route.ts:

```ts
import { webhookCallback } from 'grammy';
import { NextResponse } from 'next/server';

import { createBot } from '@/lib/bot';

const bot = createBot();

export const POST = webhookCallback(bot, 'std/http');

export async function GET() {
  try {
    const webhook = await bot.api.getWebhookInfo();

    return NextResponse.json({ webhook });
  } catch (error) {
    console.error('Error while retrieving webhook');
    console.info(error);

    return NextResponse.json({ error });
  }
}
```

---

drizzle.config.ts:

```ts
import type { Config } from 'drizzle-kit';

import 'dotenv/config';

declare global {

  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL_UNPOOLED: string;
    }
  }
}

if (!process.env.DATABASE_URL_UNPOOLED) {
  throw new Error('DATABASE_URL_UNPOOLED environment variable is required');
}

export default {
  schema: './lib/db/model',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED,
  },
  verbose: true,
  strict: true,
} satisfies Config;
```

---

eslint.config.mjs:

```mjs
import antfu from '@antfu/eslint-config';
import nextPlugin from '@next/eslint-plugin-next';

export default antfu({
  react: true,
  stylistic: {
    semi: true,
    overrides: {
      'style/brace-style': ['error', '1tbs'],
      'no-console': 'off',
    },
  },
  typescript: {
    tsconfigPath: 'tsconfig.json',
  },
}, {
  plugins: {
    '@next/next': nextPlugin,
  },
}, {
  rules: {
    'node/prefer-global/process': 'off',
    'perfectionist/sort-imports': ['error', {
      internalPattern: ['^~/.+', '^@/.+', '^#.+'],
      groups: [
        'type',
        ['parent-type', 'sibling-type', 'index-type', 'internal-type'],
        'builtin',
        'external',
        'internal',
        ['parent', 'sibling', 'index'],
        'side-effect',
        'object',
        'unknown',
      ],
    }],
  },
}, {
  ignores: ['.next/*', './components/ui/*.tsx'],
});
```

---

instrumentation.ts:

```ts
import { createBot } from '@/lib/bot';

declare global {

  namespace NodeJS {
    interface ProcessEnv {
      NEXT_RUNTIME: 'nodejs' | 'edge';
      VERCEL_ENV: 'production';
      VERCEL_PROJECT_PRODUCTION_URL: string;
    }
  }
}

async function registerTelegramWebhook() {
  const bot = createBot(false);

  const endpoint = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  console.log('[setTelegramWebhook] setting new endpoint:', endpoint);

  try {
    await bot.api.setWebhook(endpoint);
    console.log('[setTelegramWebhook] ✅ endpoint set successfully!');
  } catch (error) {
    console.error('[setTelegramWebhook] ❌ endpoint set error!');
    console.log(error);
  }
}

export async function register() {
  if (
    process.env.VERCEL_ENV === 'production'
    && process.env.VERCEL_PROJECT_PRODUCTION_URL
    && process.env.NEXT_RUNTIME === 'nodejs'
  ) {
    await registerTelegramWebhook();
  }
}
```

---

lib/bot/commands/help.ts:

```ts
import type { Bot } from '../';

import { commands } from '../constants';

export function createHelpMessage(bot: Bot) {
  const commandDescriptions = commands.map(({ command, description }) => `• /${command} \\- ${description}`).join('\n');

  bot.command('help', async (ctx) => {
    console.log('[help] Received help command');

    await ctx.reply(
      `⚙️ *Commands*:

${commandDescriptions}`,
      { parse_mode: 'MarkdownV2' },
    );
  });
}
```

---

lib/bot/commands/list.ts:

```ts
import type { Bot } from '@/lib/bot';

import { signupConversationId } from '@/lib/bot/constants';
import { listTrackedMangas } from '@/lib/db/action/manga';
import { findUserByTelegramId } from '@/lib/db/action/user';

export function createListConversation(bot: Bot) {
  bot.command('list', async (ctx) => {
    const telegramId = ctx.chat.id;
    console.log('[track] Received list command', telegramId);
    const user = await findUserByTelegramId(telegramId);
    if (!user) {
      await ctx.conversation.enter(signupConversationId);
      return;
    }

    const mangas = await listTrackedMangas(user.id);

    if (mangas.length === 0) {
      await ctx.reply('You\'re not tracking any manga yet: tap /track to track your first manga');
      return;
    }

    await ctx.reply(`Here is what you're currently tracking:\n\n${
      mangas.map(manga => `• ${manga.title} (${manga.chaptersCount})`).join('\n')
    }`);
  });
}
```

---

lib/bot/commands/signup.ts:

```ts
import type { Conversation } from '@grammyjs/conversations';
import type { Context } from 'grammy';

import type { Bot } from '@/lib/bot';

import { createConversation } from '@grammyjs/conversations';

import { signupConversationId } from '@/lib/bot/constants';
import { upsertUser } from '@/lib/db/action/user';
import { userValidation } from '@/lib/validation/user';

export function createSignupConversation(bot: Bot) {
  async function signup(conversation: Conversation, ctx: Context) {
    console.log('[signup] Entered signup conversation');
    await ctx.reply('Hi there! What is your name?');

    const ctxName = await conversation.waitFor('message:text');
    const telegramId = ctxName.chat.id;
    const name = ctxName.message.text;
    console.log('[signup] Received name:', name);
    const preEmailCheckpoint = conversation.checkpoint();
    await ctx.reply(`Welcome to Manga Mailer, ${name}!`);
    await ctx.reply(`Where do you want us to mail you updates?`);

    const ctxEmail = await conversation.waitFor('message:text');
    const email = ctxEmail.message.text;
    console.log('[signup] Received email:', email);

    const newUser = {
      telegramId,
      name,
      email,
    };

    const result = await conversation.external(async () => upsertUser(newUser));

    if (!result.success) {
      if (result.validationError) {
        console.error('[signup] Validation error:', result.validationError);
        await ctx.reply(`❗️ Something went wrong:\n\n• ${result.validationError.join('\n •')}`);
        await conversation.rewind(preEmailCheckpoint);
      } else if (typeof result.databaseError === 'string') {
        console.error('[signup] Database error:', result.databaseError);
        await ctx.reply('❗️ Something went wrong, please try again later');
        return;
      }
    } else {
      await ctx.reply(`Perfect, we'll use "${email}" as email address!`);
      console.log('[signup] Saved user:', telegramId, name, email);
    }
    const parsingResult = userValidation.safeParse(newUser);
    if (!parsingResult.success) {
      console.error('[signup] Validation error:', parsingResult.error);
      await ctx.reply(`❗️ Something went wrong:\n${Object.entries(parsingResult.error.flatten().fieldErrors)
        .map(([field, errors]) => `• ${field}: ${errors.join(', ')}`)
        .join('\n')}`);
      await conversation.rewind(preEmailCheckpoint);
    }
  }
  bot.use(createConversation(signup, {
    id: signupConversationId,
  }));

  bot.command('start', async (ctx) => {
    console.log('[signup] Received start command');
    await ctx.conversation.enter(signupConversationId);
  });
}
```

---

lib/bot/commands/track.ts:

```ts
import type { Conversation } from '@grammyjs/conversations';
import type { Context } from 'grammy';

import type { Bot } from '@/lib/bot';

import { createConversation } from '@grammyjs/conversations';
import { InlineKeyboard } from 'grammy';

import { signupConversationId, trackConversationId } from '@/lib/bot/constants';
import { trackManga } from '@/lib/db/action/manga';
import { findUserByTelegramId } from '@/lib/db/action/user';
import { getManga, searchMangas } from '@/lib/manga';

export function createTrackConversation(bot: Bot) {
  async function track(conversation: Conversation, ctx: Context) {
    console.log('[track] Entered track conversation');
    await ctx.reply('Hi there! What is the name of the manga you want to track?');

    const ctxName = await conversation.waitFor('message:text');
    const telegramId = ctxName.chat.id;
    const title = ctxName.message.text;
    console.log('[track] Received title', title);
    await ctx.reply(`Cool, I'm searching for "${title}"...`);
    const mangas = await conversation.external(async () => searchMangas(title));

    if (mangas.length === 0) {
      await ctx.reply('No manga found');
      return;
    }

    const buttons = mangas.map(manga =>
      [
        InlineKeyboard.text(
          `[${manga.connectorName}] ${manga.title} (${manga.chaptersCount})`,
          `${manga.connectorName}:${manga.id}`,
        ),
      ]);
    buttons.push([InlineKeyboard.text('❌ Cancel', '/cancel')]);
    await ctx.reply('Please select the manga you want to track:', {
      reply_markup: InlineKeyboard.from(buttons),
    });

    const ctxManga = await conversation.waitFor('callback_query:data');
    const data = ctxManga.callbackQuery.data;
    if (data === '/cancel') {
      return;
    }
    const [connectorName, mangaId] = data.split(':');
    await ctx.reply('Retrieving the selected manga...');

    const manga = await conversation.external(async () => getManga(connectorName, mangaId));
    const result = await conversation.external(async () => trackManga(manga, telegramId));

    if (result.success) {
      await ctx.reply(`Perfect, we'll track "${manga.title}" on "${manga.sourceName}"!`);
    } else if (result.invalidUser) {
      await ctx.reply('❗️ Invalid user. Please try to /start again');
    } else if (result.alreadyTracked) {
      await ctx.reply('❗️ It seems you\'re already tracking this manga!');
    } else {
      console.error('[track] Database error:', result.databaseError);
      await ctx.reply('❗️ Something went wrong, please try again later');
    }
  }
  bot.use(createConversation(track, {
    id: trackConversationId,
  }));

  bot.command('track', async (ctx) => {
    const telegramId = ctx.chat.id;
    console.log('[track] Received track command', telegramId);
    const user = await findUserByTelegramId(telegramId);

    if (user) {
      await ctx.conversation.enter(trackConversationId);
    } else {
      await ctx.conversation.enter(signupConversationId);
    }
  });
}
```

---

lib/bot/constants.ts:

```ts
import type { BotCommand } from 'grammy/types';

export const commands: BotCommand[] = [
  { command: 'start', description: 'Signup to the bot, providing name and email address' },
  { command: 'track', description: 'Track a new manga' },
  { command: 'list', description: 'List all the manga you are tracking' },
  { command: 'remove', description: 'Remove a tracked manga' },
];

export const signupConversationId = 'signup';
export const trackConversationId = 'track';
```

---

lib/bot/index.ts:

```ts
import type { ConversationFlavor } from '@grammyjs/conversations';
import type { Context } from 'grammy';

import {
  conversations,
} from '@grammyjs/conversations';
import { Bot as BotConstructor } from 'grammy';

import { createHelpMessage } from '@/lib/bot/commands/help';
import { createListConversation } from '@/lib/bot/commands/list';
import { createSignupConversation } from '@/lib/bot/commands/signup';
import { createTrackConversation } from '@/lib/bot/commands/track';

declare global {

  namespace NodeJS {
    interface ProcessEnv {
      TELEGRAM_TOKEN: string;
    }
  }
}

export type Bot = BotConstructor<ConversationFlavor<Context>>;

export function createBot(doInit = true) {
  const bot = new BotConstructor<ConversationFlavor<Context>>(process.env.TELEGRAM_TOKEN);

  if (doInit) {
    bot.use(conversations());

    createSignupConversation(bot);
    createTrackConversation(bot);
    createListConversation(bot);
    createHelpMessage(bot);
  }

  bot.on('message', async (ctx) => {
    console.log('Received message', ctx.message);
    await ctx.reply('❗️ I don\'t understand... tap /help to see the list of commands that you can use.');
  });

  return bot;
}
```

---

lib/db/action/manga.ts:

```ts
import { and, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { findUserByTelegramId } from '@/lib/db/action/user';
import { mangaTable, userMangaTable } from '@/lib/db/model';

type TrackMangaOutput = {
  success: true;
} | {
  success: false;
  invalidUser: boolean;
  alreadyTracked: boolean;
  databaseError?: string;
};

export async function trackManga(manga: typeof mangaTable.$inferInsert, telegramId: number): Promise<TrackMangaOutput> {
  try {
    const user = await findUserByTelegramId(telegramId);
    if (!user) {
      return {
        success: false,
        invalidUser: true,
        alreadyTracked: false,
      };
    }

    let existingManga = await db.query.mangaTable.findFirst({
      where: and(
        eq(mangaTable.sourceName, manga.sourceName),
        eq(mangaTable.sourceId, manga.sourceId),
      ),
    });

    if (!existingManga) {
      [existingManga] = await db.insert(mangaTable).values(manga).returning();
    }

    const existingTracker = await db.query.userMangaTable.findFirst({
      where: and(
        eq(userMangaTable.userId, user.id),
        eq(userMangaTable.mangaId, existingManga.id),
      ),
    });

    if (existingTracker) {
      return {
        success: false,
        invalidUser: false,
        alreadyTracked: true,
      };
    }

    await db.insert(userMangaTable).values({
      userId: user.id,
      mangaId: existingManga.id,
    });

    return { success: true };
  } catch (error) {
    console.error('[action:manga:trackManga] Database error:', error);

    return {
      success: false,
      invalidUser: false,
      alreadyTracked: false,
      databaseError: (error as Error).message,
    };
  }
}

export async function listTrackedMangas(userId: string): Promise<(typeof mangaTable.$inferSelect)[]> {
  // const userMangas = await db.query.userMangaTable.findMany({
  //   where: eq(userMangaTable.userId, userId),
  //   with: {
  //     manga: true,
  //   },
  // });

  const mangas = await db.query.mangaTable.findMany({
    where: eq(userMangaTable.userId, userId),
    with: {
      userManga: true,
    },
    orderBy: (manga, { asc }) => asc(manga.title),
  });

  return mangas;
}
```

---

lib/db/action/user.ts:

```ts
import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { userTable } from '@/lib/db/model';
import { userValidation } from '@/lib/validation/user';

interface UpsertInput {
  telegramId: number;
  name: string;
  email: string;
}

type UpsertOutput = {
  success: true;
} | {
  success: false;
  validationError?: { field: string; error: string }[];
  databaseError?: string;
};

export async function upsertUser(newUser: UpsertInput): Promise<UpsertOutput> {
  const parsingResult = userValidation.safeParse(newUser);
  if (!parsingResult.success) {
    console.error('[action:user:upsertUser] Validation error:', parsingResult.error);

    return {
      success: false,
      validationError: Object.entries(parsingResult.error.flatten().fieldErrors).map(([field, errors]) => ({ field, error: errors.join(', ') })),
    };
  }

  const user = await db.query.userTable.findFirst({
    where: eq(userTable.telegramId, newUser.telegramId),
  });

  try {
    if (user) {
      await db.update(userTable).set(newUser).where(eq(userTable.id, user.id));
    } else {
      await db.insert(userTable).values(newUser);
    }
  } catch (error) {
    console.error('[action:user:upsertUser] Database error:', error);

    return { success: false, databaseError: (error as Error).message };
  }

  return { success: true };
}

export async function findUserByTelegramId(telegramId: number): Promise<typeof userTable.$inferSelect | undefined> {
  const user = await db.query.userTable.findFirst({
    where: eq(userTable.telegramId, telegramId),
  });

  return user;
}
```

---

lib/db/index.ts:

```ts
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

import * as schema from '@/lib/db/model';

declare global {

  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
    }
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const db = drizzle({
  connection: process.env.DATABASE_URL,
  schema,
  ws,
});
```

---

lib/db/model/helpers.ts:

```ts
import { timestamp } from 'drizzle-orm/pg-core';

export const timestamps = {
  createdAt: timestamp({ mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: 'date' }).$onUpdate(() => new Date()),
};
```

---

lib/db/model/index.ts:

```ts
export * from './manga';
export * from './user';
```

---

lib/db/model/manga.ts:

```ts
import { relations } from 'drizzle-orm';
import { integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

import { timestamps } from '@/lib/db/model/helpers';
import { userMangaTable } from '@/lib/db/model/user';

export const statusType = pgEnum('type', [
  'Ongoing',
  'Completed',
  'Hiatus',
  'Cancelled',
  'Unknown',
]);
export const mangaTable = pgTable('manga', {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sourceName: text().notNull(),
  sourceId: text().notNull(),
  slug: text(),
  title: text(),
  author: text(),
  artist: text(),
  excerpt: text(),
  image: text(),
  url: text(),
  releasedAt: timestamp({ mode: 'date' }),
  status: statusType(),
  genres: jsonb('genres').$type<string[]>(),
  score: integer(),
  chaptersCount: integer(),
  ...timestamps,
}, mangaTable => [
  {
    sourceUniqueIndex: uniqueIndex('manga_unique_source_idx').on(mangaTable.sourceName, mangaTable.sourceId),
  },
]);

export const mangaRelations = relations(mangaTable, ({ many }) => ({
  userManga: many(userMangaTable),
}));
```

---

lib/db/model/user.ts:

```ts
import { relations } from 'drizzle-orm';
import { index, integer, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';

import { timestamps } from '@/lib/db/model/helpers';
import { mangaTable } from '@/lib/db/model/manga';

export const userTable = pgTable('user', {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text(),
  email: text().unique(),
  emailVerified: timestamp({ mode: 'date' }),
  image: text(),
  telegramId: integer().unique(),

  ...timestamps,
}, userTable => [{
  telegramIdIdx: index('user_telegramId_idx').on(userTable.telegramId),
  emailIdx: index('client_email_idx').on(userTable.email),
}]);

export const userMangaTable = pgTable('user-manga', {
  userId: text()
    .references(() => userTable.id, { onDelete: 'cascade' })
    .notNull(),
  mangaId: text()
    .references(() => mangaTable.id, { onDelete: 'cascade' })
    .notNull(),

  ...timestamps,
}, userMangaTable => [
  primaryKey({ columns: [userMangaTable.userId, userMangaTable.mangaId] }),
]);

export const userRelations = relations(userTable, ({ many }) => ({
  userManga: many(userMangaTable),
}));

export const userMangaRelations = relations(userMangaTable, ({ one }) => ({
  user: one(userTable),
  manga: one(mangaTable),
}));
```

---

lib/manga.ts:

```ts
import type { ConnectorNames } from '@zweer/manga-scraper';

import type { mangaTable } from '@/lib/db/model/manga';

import { connectors } from '@zweer/manga-scraper';

interface MangaAutocomplete {
  connectorName: string;
  id: string;
  title: string;
  chaptersCount: number;
}

export async function searchMangas(title: string): Promise<MangaAutocomplete[]> {
  console.log('[manga] search:', title);

  const mangas: MangaAutocomplete[] = [];

  await Object.entries(connectors).reduce(async (promise, [connectorName, connector]) => {
    await promise;

    const newMangas = await connector.getMangas(title);

    mangas.push(
      ...newMangas.map(manga => ({
        connectorName,
        id: manga.id,
        title: manga.title,
        chaptersCount: manga.chaptersCount,
      })),
    );
  }, Promise.resolve());

  mangas.sort((mangaA, mangaB) => {
    if (mangaA.title.localeCompare(mangaB.title) === 0) {
      return mangaA.chaptersCount - mangaB.chaptersCount;
    }
    return mangaA.title.localeCompare(mangaB.title);
  });

  console.log('[manga] mangas found:', mangas.length);

  return mangas;
}

export async function getManga(connectorName: string, id: string): Promise<typeof mangaTable.$inferInsert> {
  const connector = connectors[connectorName as ConnectorNames];

  if (!connector) {
    throw new Error('Invalid connector name');
  }

  const manga = await connector.getManga(id);

  return {
    sourceName: connectorName,
    sourceId: id,
    slug: manga.slug,
    title: manga.title,
    author: manga.author,
    artist: manga.artist,
    excerpt: manga.excerpt,
    image: manga.image,
    url: manga.url,
    releasedAt: manga.releasedAt,
    status: manga.status,
    genres: manga.genres,
    score: manga.score,
    chaptersCount: manga.chaptersCount,
  };
}
```

---

lib/validation/user.ts:

```ts
import * as z from 'zod';

export const userValidation = z.object({
  name: z.string(),
  email: z.string().email({ message: 'Invalid email address' }),
  telegramId: z.number(),
}).partial();
```

---

next.config.ts:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

---

package.json:

```json
{
  "name": "manga-mailer",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "export-code": "node -r esbuild-register script/export.ts"
  },
  "dependencies": {
    "@grammyjs/conversations": "^2.1.0",
    "@neondatabase/serverless": "^1.0.0",
    "@zweer/manga-scraper": "^2.1.2",
    "bufferutil": "^4.0.9",
    "grammy": "^1.36.1",
    "next": "15.3.2",
    "ws": "^8.18.2",
    "zod": "^3.24.4"
  },
  "devDependencies": {
    "@antfu/eslint-config": "^4.13.0",
    "@eslint-react/eslint-plugin": "^1.49.0",
    "@next/eslint-plugin-next": "^15.3.2",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/ws": "^8.18.1",
    "dotenv": "^16.5.0",
    "drizzle-kit": "^0.31.1",
    "drizzle-orm": "^0.43.1",
    "esbuild-register": "^3.6.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "ignore": "^7.0.4",
    "typescript": "^5"
  }
}
```

---

script/export.ts:

```ts
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

import ignore from 'ignore';

const rootFolder = join(__dirname, '..');
const ignoreFilename = join(rootFolder, '.gitignore');
const ignoreFile = `${readFileSync(ignoreFilename).toString()}
.git
*.md
*.svg
*.ico
drizzle
package-lock.json`;
// console.log('Ignore file:', ignoreFile);
const files = readdirSync(rootFolder, { recursive: true, encoding: 'utf-8' });

const files2export = ignore()
  .add(ignoreFile)
  .filter(files)
  .sort();
// console.log('Files to export:', files2export);

const docFolder = join(rootFolder, 'docs');
if (!existsSync(docFolder)) {
  mkdirSync(docFolder);
}

const exportFilename = join(docFolder, 'export.md');
const filesExport = files2export.map((file) => {
  const filePath = join(rootFolder, file);
  if (lstatSync(filePath).isDirectory()) {
    return null;
  }

  const fileContent = readFileSync(filePath, { encoding: 'utf-8' });

  const extension = file.split('.').pop();

  return `${file}:\n\n\`\`\`${extension}\n${fileContent}\n\`\`\``;
}).filter(fileString => fileString != null).join('\n\n---\n\n');
const exportString = `# File export\n\n${filesExport}`;

writeFileSync(exportFilename, exportString, { encoding: 'utf-8' });
```

---

tsconfig.json:

```json
{
  "compilerOptions": {
    "incremental": true,
    "target": "ES2017",
    "jsx": "preserve",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./*"]
    },
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```
