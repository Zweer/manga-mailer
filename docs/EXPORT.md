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
  ],
  "vsicons.associations.folders": [
    {
      "icon": "db",
      "extensions": ["db", "database", "drizzle", "sql", "data", "repo", "repository", "repositories"],
      "format": "svg"
    }
  ]
}
```

---

README.md:

```md
# Manga Mailer Bot

Manga Mailer is a Telegram bot designed to help users track their favorite manga and receive email notifications when new chapters are released.

## ✨ Key Features (Current)

*   **User Registration**: A simple onboarding process via the `/start` command to collect name and email address.
*   **Manga Tracking**: Allows users to search for manga from various sources (thanks to `@zweer/manga-scraper`) and add them to their tracking list using the `/track` command.
*   **List Tracked Manga**: Displays all manga a user is currently following with the `/list` command.
*   **Help Guide**: Provides a list of available commands and their descriptions via `/help`.

## 🚀 Tech Stack

*   **Framework**: Next.js 15
*   **Language**: TypeScript
*   **Telegram Bot**: grammY with the conversations plugin
*   **Database**: PostgreSQL
*   **ORM**: Drizzle ORM
*   **Manga Scraping**: `@zweer/manga-scraper`
*   **Linting**: ESLint with `@antfu`'s config
*   **Deployment (Bot Webhook)**: Designed for Vercel (as per `instrumentation.ts`)

## 📋 Prerequisites

*   Node.js (version recommended in `package.json` or LTS)
*   Npm
*   An accessible PostgreSQL instance
*   A Telegram Bot Token

## ⚙️ Installation

1.  **Clone the repository**:
    ```bash
    git clone <YOUR_REPOSITORY_URL>
    cd manga-mailer
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    # yarn install
    ```

## 🛠️ Configuration

The project uses environment variables for configuration. Create a `.env` file in the project root based on `.env.example` (if it exists) or by adding the following variables:

```env
# Your Telegram Bot Token (obtained from BotFather)
TELEGRAM_TOKEN="YOUR_TELEGRAM_BOT_TOKEN"

# Connection URL for your PostgreSQL database (for Drizzle Kit and direct access)
# Example for Neon DB (used in drizzle.config.ts)
DATABASE_URL_UNPOOLED="postgresql://user:password@host:port/database?sslmode=require"

# Connection URL for your PostgreSQL database (for the Next.js application, can be the same or a pooled one)
# Example for Neon DB (used in lib/db/index.ts)
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# (For Vercel deployment, these variables are usually set in the Vercel UI)
# VERCEL_ENV="production" # or "development", "preview"
# VERCEL_PROJECT_PRODUCTION_URL="yourdomain.vercel.app" # Without https://
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

docs/CONTRIBUTING.md:

```md
# Contributing to Manga Mailer

Thank you for considering contributing to Manga Mailer! We welcome any contributions, from bug reports and feature suggestions to code contributions.

## Reporting Issues

If you find a bug or have a problem, please [open an issue](<LINK_TO_YOUR_ISSUES_PAGE_ON_GITHUB_ETC>) on our issue tracker.
Please include:

*   A clear and descriptive title.
*   Steps to reproduce the bug.
*   Expected behavior.
*   Actual behavior.
*   Screenshots or logs, if applicable.
*   Your environment details (e.g., Node.js version, OS).

## Suggesting Features

If you have an idea for a new feature or an improvement to an existing one, please [open an issue](<LINK_TO_YOUR_ISSUES_PAGE_ON_GITHUB_ETC>) to discuss it. This allows us to coordinate efforts and ensure the feature aligns with the project's goals.

## Development Setup

Please refer to the [README.md](./README.md#️-installation) for instructions on how to set up the development environment.

## Making Changes (Pull Requests)

1.  **Fork the repository** to your own GitHub account.
2.  **Clone your fork** to your local machine.
3.  **Create a new branch** for your changes:
    ```bash
    git checkout -b feature/your-feature-name
    # or
    # git checkout -b fix/your-bug-fix-name
    ```
4.  **Make your changes**. Ensure you follow the project's coding style (ESLint should help with this).
5.  **Test your changes** thoroughly. Add new tests if you are adding new functionality.
6.  **Commit your changes** with a clear and descriptive commit message. We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification (scopes are defined in `.vscode/settings.json`).
    ```bash
    git commit -m "feat(bot): add new command for X"
    # or
    # git commit -m "fix(database): resolve issue with Y query"
    ```
7.  **Push your changes** to your forked repository:
    ```bash
    git push origin feature/your-feature-name
    ```
8.  **Open a Pull Request (PR)** from your branch in your fork to the `main` (or `develop`) branch of the original Manga Mailer repository.
    *   Provide a clear title and description for your PR.
    *   Reference any related issues (e.g., "Closes #123").

## Coding Guidelines

*   **Follow ESLint rules**: Run `yarn lint` to check your code.
*   **TypeScript**: Use TypeScript's features appropriately for type safety.
*   **Clarity**: Write clear, understandable, and maintainable code. Add comments where necessary to explain complex logic.
*   **Database Migrations**: If you make changes to the database schema (`lib/db/model/`), you **must** generate a new migration file using `yarn db:generate`. Do not edit migration files manually unless you know what you are doing. Commit the generated migration file with your changes.

## Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms. (You might want to add a `CODE_OF_CONDUCT.md` file, a common one is the Contributor Covenant).

Thank you for your contribution!
```

---

docs/PROJECT_DETAILS.md:

```md
# Manga Mailer Project Details

This document provides a more in-depth look at the architecture, internal workings, and key components of the Manga Mailer project.

## 1. Introduction

Manga Mailer is an application built to allow users to track their favorite manga via a Telegram bot and, in a later phase, receive email updates. The system relies on a Telegram bot for user interaction and a Next.js backend that manages bot logic and database interaction.

## 2. Architecture

The project primarily consists of three parts:

*   **Telegram Bot (User Interface)**: Built with the `grammY` library. It handles user commands, conversations for information gathering, and data display.
*   **Backend (Next.js)**:
    *   Serves as the endpoint for Telegram's webhook (`app/route.ts`).
    *   Contains business logic for database interactions (actions in `lib/db/action/`).
    *   In the future, it will host cron jobs (or integrate with external services) for checking manga updates.
*   **Database (PostgreSQL)**:
    *   Uses Drizzle ORM for schema definition, queries, and migrations.
    *   Stores information about users, tracked manga, and their associations.

### Typical Interaction Flow (Webhook)

1.  The user sends a message/command to the Telegram bot.
2.  Telegram forwards the message (update) to the configured webhook endpoint (e.g., `https://<your-domain>/api/route`).
3.  The Next.js application receives the update via `app/route.ts`.
4.  `grammY` processes the update, triggering appropriate command handlers or conversations defined in `lib/bot/`.
5.  Handlers interact with database action modules (`lib/db/action/`) to read or write data.
6.  The bot responds to the user via the Telegram API.

## 3. Telegram Bot Operation

The bot is the core of user interaction.

### 3.1. Initialization (`lib/bot/index.ts`)

*   `createBot()`: Initializes the bot instance, registers plugins (like `@grammyjs/conversations`), and sets up handlers for commands and generic messages.
*   **Webhook Setup (`instrumentation.ts`)**: For production deployments on Vercel, this script automatically sets the Telegram bot's webhook URL when the application starts.

### 3.2. Main Commands

*   **`/start` (Signup - `lib/bot/commands/signup.ts`)**:
    *   Initiates a conversation to register a new user or update an existing user's data.
    *   Requests name and email address.
    *   Uses `upsertUser` to save/update data in the database.
    *   Includes data validation via Zod (`lib/validation/user.ts`).

*   **`/track` (Manga Tracking - `lib/bot/commands/track.ts`)**:
    *   Starts a conversation to track a new manga.
    *   Asks the user for the title of the manga to search.
    *   Uses `searchMangas` (from `lib/manga.ts`, which in turn uses `@zweer/manga-scraper`) to find matching manga from various sources.
    *   Presents results to the user with inline buttons for selection.
    *   Once selected, retrieves manga details with `getManga`.
    *   Saves the manga and the user-manga association in the database via `trackManga`.
    *   Handles cases like unregistered users (redirects to signup) or already tracked manga.

*   **`/list` (List Manga - `lib/bot/commands/list.ts`)**:
    *   Retrieves and displays all manga the user is currently tracking.
    *   Uses `findUserByTelegramId` to identify the user.
    *   Uses `listTrackedMangas` to get manga from the database.
    *   Informs the user if they are not tracking any manga.

*   **`/help` (Help - `lib/bot/commands/help.ts`)**:
    *   Displays a formatted message with the list of available commands and a brief description for each, taken from `lib/bot/constants.ts`.

### 3.3. Generic Message Handling

If the bot receives a message that doesn't match any registered command, it replies with a message prompting the user to use `/help`.

## 4. Database (Drizzle ORM)

The database schema is defined in `lib/db/model/`.

### 4.1. Main Tables

*   **`userTable` (`lib/db/model/user.ts`)**:
    *   Stores user information (ID, name, email, Telegram ID, timestamps).
    *   Has indexes on `telegramId` and `email` for fast lookups and uniqueness.

*   **`mangaTable` (`lib/db/model/manga.ts`)**:
    *   Stores manga details (ID, source, title, author, chapters, URL, etc.).
    *   Has a unique index on the combination of `sourceName` and `sourceId` to prevent duplicates from the same source.
    *   Includes a `statusType` enum for manga status.

*   **`userMangaTable` (`lib/db/model/user.ts`)**:
    *   Join table for the many-to-many relationship between users and manga.
    *   Contains `userId` and `mangaId` as a composite primary key and foreign keys to their respective tables.
    *   Uses `onDelete: 'cascade'` so if a user or manga is deleted, related associations in this table are automatically removed.

### 4.2. Database Actions (`lib/db/action/`)

These files contain the logic for interacting with the database:

*   `lib/db/action/user.ts`:
    *   `upsertUser`: Creates a new user or updates an existing one. Includes input data validation.
    *   `findUserByTelegramId`: Finds a user by their Telegram ID.

*   `lib/db/action/manga.ts`:
    *   `trackManga`: Handles the logic for tracking a manga. It first checks if the user exists, then if the manga already exists in the DB (inserting it if not), and finally if the user is already tracking that manga.
    *   `listTrackedMangas`: Retrieves all manga tracked by a specific user, ordered by title.

### 4.3. Migrations

Drizzle Kit is used to generate and manage database migrations:

*   `yarn db:generate`: Analyzes the schema in `lib/db/model` and generates SQL migration files in `drizzle/`.
*   `yarn db:migrate`: Applies pending migrations to the configured database.

## 5. Manga Searching (`lib/manga.ts`)

*   **`searchMangas(title)`**:
    *   Iterates over all available connectors from `@zweer/manga-scraper`.
    *   Calls `connector.getMangas(title)` for each connector.
    *   Aggregates and sorts the results before returning them.
*   **`getManga(connectorName, id)`**:
    *   Retrieves detailed information for a specific manga from a specific connector.
    *   Maps the data to the format expected by `mangaTable.$inferInsert`.

## 6. Important Configurations

*   **`.env`**: Crucial file for environment variables (see `README.md`).
*   **`drizzle.config.ts`**: Configuration for Drizzle Kit, particularly `DATABASE_URL_UNPOOLED` for migrations.
*   **`eslint.config.mjs`**: Code standards and linting.
*   **`tsconfig.json`**: TypeScript compiler options.
*   **`next.config.ts`**: Next.js configuration (currently minimal).
```

---

docs/TODO.md:

```md
# TODO & Future Enhancements

This file tracks planned tasks, features, and improvements for the Manga Mailer project.

## 🤖 Bot Features & Commands

*   [ ] **Implement `/remove` command**:
    *   [ ] Create `createRemoveConversation(bot)` in `lib/bot/commands/`.
    *   [ ] Allow users to list their tracked manga with an option to select one for removal.
    *   [ ] Implement `removeTrackedManga(userId, mangaId)` action in `lib/db/action/manga.ts`.
    *   [ ] Add command to `lib/bot/constants.ts` and `lib/bot/index.ts`.
*   [ ] **Improve `/track` flow**:
    *   [ ] Handle cases where `searchMangas` returns a very large number of results (e.g., pagination or more specific search prompts).
    *   [ ] Allow users to confirm manga details before tracking.
*   [ ] **Refine User Onboarding (`/start`)**:
    *   [ ] Consider allowing users to update their email or name separately after initial signup.
*   [ ] **User Settings Command (e.g., `/settings`)**:
    *   [ ] Allow users to view/change their registered email.
    *   [ ] (Future) Configure notification preferences.

## 📧 Email Notification System

*   [ ] **Email Service Integration**:
    *   [ ] Choose and integrate an email sending service (e.g., Resend, SendGrid, Nodemailer with an SMTP provider).
    *   [ ] Add necessary environment variables for the email service.
*   [ ] **Email Templating**:
    *   [ ] Design and implement email templates for new chapter notifications.
    *   [ ] Consider using a templating engine if emails become complex.
*   [ ] **Logic for Sending Emails**:
    *   [ ] Create a function/module to send emails to users when new chapters are detected.

## 🔄 Cron Jobs / Scheduled Tasks

*   [ ] **Manga Update Checker**:
    *   [ ] Design a system to periodically check for new chapters of all tracked manga.
        *   Iterate through all `mangaTable` entries that are being tracked by at least one user.
        *   Use `@zweer/manga-scraper`'s `getManga` or a similar function to fetch the latest chapter count/list.
        *   Compare with the stored `chaptersCount` (or a more detailed chapter list if implemented).
    *   [ ] Update `mangaTable` with new chapter information.
*   [ ] **Notification Trigger**:
    *   [ ] If new chapters are found, trigger the email notification system for subscribed users.
*   [ ] **Cron Job Implementation**:
    *   [ ] Choose a cron job provider/method (e.g., Vercel Cron Jobs, GitHub Actions scheduled workflow, a separate Node.js process with `node-cron` or similar).
    *   [ ] Implement the job to run the manga update checker at a regular interval (e.g., daily, hourly).

## ⚙️ Backend & Database

*   [ ] **Detailed Chapter Tracking (Optional Enhancement)**:
    *   [ ] Instead of just `chaptersCount`, consider a new table `mangaChapterTable` to store individual chapter details (number, title, URL, release date). This would allow more precise notifications.
    *   [ ] This would require significant changes to manga fetching, storage, and update logic.
*   [ ] **Error Handling & Logging**:
    *   [ ] Implement more robust error handling across all modules.
    *   [ ] Integrate a logging service for production (e.g., Sentry, Logtail) or improve console logging with levels.
*   [ ] **Database Indexing Review**:
    *   [ ] As data grows, review and optimize database queries and indexes.
*   [ ] **API Security**:
    *   [ ] Review webhook security (e.g., verifying requests from Telegram if necessary, though grammY might handle some of this).

## 🧪 Testing

*   [ ] **Unit Tests**:
    *   [ ] Write unit tests for helper functions, validation schemas, and critical business logic in database actions.
    *   [ ] Consider a testing framework like Jest or Vitest.
*   [ ] **Integration Tests**:
    *   [ ] Test interactions between different modules (e.g., bot command triggering database action).
    *   [ ] Test the conversation flows.
*   [ ] **E2E Tests (Optional)**:
    *   [ ] Simulate user interaction with the bot from start to finish for key scenarios.

## 📚 Documentation

*   [ ] **API Documentation (if internal APIs expand)**:
    *   [ ] Document any internal API routes if the project grows beyond just the bot webhook.
*   [ ] **Deployment Guide**:
    *   [ ] Expand on deployment options beyond Vercel if needed.
*   [ ] **Keep `PROJECT_DETAILS.md` up-to-date** as features are added/changed.

## 🌐 Miscellaneous

*   [ ] **Internationalization (i18n)**:
    *   [ ] Plan for supporting multiple languages in bot responses.
*   [ ] **Code Refactoring**:
    *   [ ] Periodically review and refactor code for clarity, performance, and maintainability.
*   [ ] **Add a License File**: E.g., `LICENSE.md` with MIT or another open-source license.
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
  rules: {
    'ts/no-unsafe-assignment': 'off',
    'ts/no-unsafe-call': 'off',
    'ts/no-unsafe-member-access': 'off',
    'ts/no-unsafe-return': 'off',
  },
  files: ['test/setup.ts', '**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
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
    if (email === '/cancel') {
      return;
    }
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
        await ctx.reply(`❗️ Something went wrong:\n\n${result.validationError.map(({ field, error }) => `• ${field}: ${error}`).join('\n')}`);
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
    await ctx.reply('Which chapter you read last? (if you don\'t know, type "0")');

    const ctxChapter = await conversation.waitFor('message:text');
    const lastReadChapter = Number.parseFloat(ctxChapter.message.text);
    const result = await conversation.external(async () => trackManga(manga, telegramId, lastReadChapter));

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

lib/db/action/manga.test.ts:

```ts
import type { MangaInsert, User, UserInsert } from '@/lib/db/model';

import { db } from '@/lib/db';
import { listTrackedMangas, trackManga } from '@/lib/db/action/manga';
import { mangaTable, userMangaTable, userTable } from '@/lib/db/model';

const testUser: UserInsert = {
  name: 'Manga Tracker User',
  email: 'tracker@example.com',
  telegramId: 1001,
};

const testMangaData: MangaInsert = {
  sourceName: 'Test Source',
  sourceId: 'test-manga-001',
  title: 'The Great Test Manga',
  chaptersCount: 10,
  slug: 'the-great-test-manga',
  author: 'Test Author',
  artist: 'Test Artist',
  excerpt: 'An excerpt',
  image: 'http://example.com/image.jpg',
  url: 'http://example.com/manga',
  status: 'Ongoing',
  genres: ['action', 'test'],
  score: 8.5,
  releasedAt: new Date(),
};

describe('db -> action -> manga', () => {
  let createdUser: User;

  beforeEach(async () => {
    [createdUser] = await db.insert(userTable).values(testUser).returning();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('trackManga', () => {
    it('should track a new manga for a user successfully (manga not in DB)', async () => {
      const lastReadChapter = 0;
      const result = await trackManga(testMangaData, createdUser.telegramId, lastReadChapter);
      expect(result).toHaveProperty('success', true);

      const manga = await db.query.mangaTable.findFirst({
        where: (manga, { eq }) => eq(manga.sourceId, testMangaData.sourceId),
      });
      expect(manga).toBeDefined();
      if (typeof manga === 'undefined') {
        throw new TypeError('Invalid test');
      }
      expect(manga).toHaveProperty('title', testMangaData.title);

      const tracker = await db.query.userMangaTable.findFirst({
        where: (userManga, { and, eq }) => and(
          eq(userManga.userId, createdUser.id),
          eq(userManga.mangaId, manga.id),
        ),
      });
      expect(tracker).toBeDefined();
      if (typeof tracker === 'undefined') {
        throw new TypeError('Invalid test');
      }
      expect(tracker).toHaveProperty('lastReadChapter', lastReadChapter);
    });

    it('should track an existing manga for a user successfully (manga already in DB)', async () => {
      const [manga] = await db.insert(mangaTable).values(testMangaData).returning();

      const lastReadChapter = 1;
      const result = await trackManga(manga, createdUser.telegramId, lastReadChapter);
      expect(result).toHaveProperty('success', true);

      const tracker = await db.query.userMangaTable.findFirst({
        where: (userManga, { and, eq }) => and(
          eq(userManga.userId, createdUser.id),
          eq(userManga.mangaId, manga.id),
        ),
      });
      expect(tracker).toBeDefined();
      if (typeof tracker === 'undefined') {
        throw new TypeError('Invalid test');
      }
      expect(tracker).toHaveProperty('lastReadChapter', lastReadChapter);
    });

    it('should return invalidUser if the user does not exist', async () => {
      const nonExistentTelegramId = 9999;
      const result = await trackManga(testMangaData, nonExistentTelegramId, 0);
      expect(result).toHaveProperty('success', false);
      if (result.success) {
        throw new Error('Test failed');
      }
      expect(result).toHaveProperty('invalidUser', true);
    });

    it('should return alreadyTracked if the manga is already tracked by the user', async () => {
      const lastReadChapter = 0;
      await trackManga(testMangaData, createdUser.telegramId, lastReadChapter);

      const result = await trackManga(testMangaData, createdUser.telegramId, lastReadChapter);
      expect(result).toHaveProperty('success', false);
      if (result.success) {
        throw new Error('Test failed');
      }
      expect(result).toHaveProperty('alreadyTracked', true);
    });

    it('should return databaseError if inserting manga fails', async () => {
      const simulatedError = 'DB Error on Manga Insert';
      const insertMangaSpy = jest.spyOn(db, 'insert')
        .mockImplementationOnce(() => ({
          values: jest.fn().mockReturnThis(),
          returning: jest.fn().mockRejectedValue(new Error(simulatedError) as never),
        } as any));

      const result = await trackManga(testMangaData, createdUser.telegramId, 0);
      expect(result).toHaveProperty('success', false);
      if (result.success) {
        throw new Error('Test failed');
      }
      expect(result).toHaveProperty('databaseError', simulatedError);
      expect(insertMangaSpy).toHaveBeenCalledTimes(1);
    });

    it('should return databaseError if inserting userManga (tracker) fails', async () => {
      const simulatedError = 'DB Error on Tracker Insert';
      const insertUserMangaSpy = jest.spyOn(db, 'insert')
        .mockImplementationOnce(() => ({
          values: jest.fn().mockReturnThis(),
          returning: jest.fn().mockResolvedValue([testMangaData] as never),
        } as any))
        .mockImplementationOnce(() => ({
          values: jest.fn().mockRejectedValue(new Error(simulatedError) as never),
        } as any));

      const mangaInsertSpy = jest.spyOn(db, 'insert')
        .mockImplementationOnce(() => ({
          values: jest.fn().mockReturnThis(),
          returning: jest.fn().mockResolvedValueOnce([{ ...testMangaData, id: 'mocked-manga-id' }] as never), // Simula che il manga sia stato inserito
        } as any))
        .mockImplementationOnce(() => ({
          values: jest.fn().mockRejectedValueOnce(new Error(simulatedError) as never),
        } as any));

      const result = await trackManga(testMangaData, createdUser.telegramId, 0);
      expect(result).toHaveProperty('success', false);
      if (result.success) {
        throw new Error('Test failed');
      }
      expect(result).toHaveProperty('databaseError', simulatedError);
      expect(insertUserMangaSpy).toHaveBeenCalledTimes(2);
      expect(mangaInsertSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('listTrackedMangas', () => {
    it('should return an empty array if user tracks no mangas', async () => {
      const mangas = await listTrackedMangas(createdUser.id);
      expect(mangas).toEqual([]);
    });

    it('should return a list of tracked mangas for the user, ordered by title', async () => {
      const manga1Data = { ...testMangaData, sourceId: 'manga001', title: 'Alpha Test Manga' };
      const manga2Data = { ...testMangaData, sourceId: 'manga002', title: 'Zulu Test Manga' };
      const manga3Data = { ...testMangaData, sourceId: 'manga003', title: 'Beta Test Manga' };

      const [manga1] = await db.insert(mangaTable).values(manga1Data).returning();
      const [manga2] = await db.insert(mangaTable).values(manga2Data).returning();
      const [manga3] = await db.insert(mangaTable).values(manga3Data).returning();

      await db.insert(userMangaTable).values([
        { userId: createdUser.id, mangaId: manga1.id, lastReadChapter: 0 },
        { userId: createdUser.id, mangaId: manga2.id, lastReadChapter: 0 },
        { userId: createdUser.id, mangaId: manga3.id, lastReadChapter: 0 },
      ]);

      const tracked = await listTrackedMangas(createdUser.id);
      expect(tracked).toHaveLength(3);
      expect(tracked).toHaveProperty('0.title', 'Alpha Test Manga');
      expect(tracked).toHaveProperty('0.id', manga1.id);
      expect(tracked).toHaveProperty('1.title', 'Beta Test Manga');
      expect(tracked).toHaveProperty('1.id', manga3.id);
      expect(tracked).toHaveProperty('2.title', 'Zulu Test Manga');
      expect(tracked).toHaveProperty('2.id', manga2.id);
    });

    it('should return an empty array if user ID does not exist (no entries in userMangaTable)', async () => {
      const mangas = await listTrackedMangas('non-existent-user-id');
      expect(mangas).toEqual([]);
    });
  });
});
```

---

lib/db/action/manga.ts:

```ts
import type { Manga, MangaInsert } from '@/lib/db/model';

import { and, eq, inArray } from 'drizzle-orm';

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

export async function trackManga(
  manga: MangaInsert,
  telegramId: number,
  lastReadChapter: number,
): Promise<TrackMangaOutput> {
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
      lastReadChapter,
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

export async function listTrackedMangas(userId: string): Promise<Manga[]> {
  const userMangas = await db.query.userMangaTable.findMany({
    where: eq(userMangaTable.userId, userId),
  });

  const mangas = await db.query.mangaTable.findMany({
    where: inArray(mangaTable.id, userMangas.map(userManga => userManga.mangaId)),
    orderBy: (manga, { asc }) => asc(manga.title),
  });

  return mangas;
}
```

---

lib/db/action/user.test.ts:

```ts
import { db } from '@/lib/db';
import { findUserByTelegramId, upsertUser } from '@/lib/db/action/user';
import { userTable } from '@/lib/db/model';

describe('db -> action -> user', () => {
  const name = 'Test User Jest';
  const email = 'testjest@example.com';
  const telegramId = 123;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findUserByTelegramId', () => {
    it('should return undefined if user is not found', async () => {
      const user = await findUserByTelegramId(12345);
      expect(user).toBeUndefined();
    });

    it('should return the user found by telegramId', async () => {
      const newUser = { name, email, telegramId };
      await db.insert(userTable).values(newUser);

      const foundUser = await findUserByTelegramId(telegramId);
      expect(foundUser).toBeDefined();
      expect(foundUser).toHaveProperty('name', name);
      expect(foundUser).toHaveProperty('email', email);
      expect(foundUser).toHaveProperty('telegramId', telegramId);
    });
  });

  describe('upsertUser', () => {
    it('should insert a new user if telegramId does not exist', async () => {
      const newUser = { name, email, telegramId };
      const result = await upsertUser(newUser);
      expect(result).toHaveProperty('success', true);

      const dbUser = await db.query.userTable.findFirst({
        where: (user, { eq }) => eq(user.telegramId, telegramId),
      });
      expect(dbUser).toBeDefined();
      expect(dbUser).toHaveProperty('name', name);
      expect(dbUser).toHaveProperty('email', email);
      expect(dbUser).toHaveProperty('telegramId', telegramId);
    });

    it('should update an existing user if telegramId exists', async () => {
      const newUser = { name, email, telegramId };
      await db.insert(userTable).values(newUser);

      const newEmail = 'new_email@example.com';
      const updatedUserInput = {
        ...newUser,
        email: newEmail,
      };
      const result = await upsertUser(updatedUserInput);
      expect(result).toHaveProperty('success', true);

      const dbUser = await db.query.userTable.findFirst({
        where: (user, { eq }) => eq(user.telegramId, telegramId),
      });
      expect(dbUser).toBeDefined();
      expect(dbUser).toHaveProperty('name', name);
      expect(dbUser).toHaveProperty('email', newEmail);
      expect(dbUser).toHaveProperty('telegramId', telegramId);
    });

    it('should return validation error for invalid email', async () => {
      const newEmail = 'invalid-email';
      const invalidUser = {
        name,
        email: newEmail,
        telegramId,
      };
      const result = await upsertUser(invalidUser);
      expect(result).toHaveProperty('success', false);
      if (result.success) {
        throw new Error('Unexpected success');
      }
      expect(result).toHaveProperty('validationError');
      expect(result).toHaveProperty('validationError.0.field', 'email');
      expect(result).toHaveProperty('validationError.0.error', 'Invalid email address');
    });

    it('should return databaseError if db.insert fails', async () => {
      const newUser = { name, email, telegramId };

      const simulatedError = 'Simulated DB Insert Error';
      const insertSpy = jest.spyOn(db, 'insert').mockImplementationOnce(() => ({
        values: jest.fn().mockRejectedValue(new Error(simulatedError)),
      }) as any);

      const result = await upsertUser(newUser);

      expect(result.success).toBe(false);
      if (result.success) {
        throw new Error('Unexpected success');
      }
      expect(result.databaseError).toBe(simulatedError);
      expect(insertSpy).toHaveBeenCalledTimes(1);
    });

    it('should return databaseError if db.update fails', async () => {
      const newUser = { name, email, telegramId };
      await db.insert(userTable).values(newUser);

      const updatedInput = {
        ...newUser,
        name: 'New Name For Update Error',
      };

      const simulatedError = 'Simulated DB Insert Error';
      const updateSpy = jest.spyOn(db, 'update').mockImplementationOnce(() => ({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockRejectedValue(new Error(simulatedError)),
      }) as any);

      const result = await upsertUser(updatedInput);

      expect(result.success).toBe(false);
      if (result.success) {
        throw new Error('Unexpected success');
      }
      expect(result.databaseError).toBe(simulatedError);
      expect(updateSpy).toHaveBeenCalledTimes(1);
    });
  });
});
```

---

lib/db/action/user.ts:

```ts
import type { User } from '@/lib/db/model';

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

export async function findUserByTelegramId(telegramId: number): Promise<User | undefined> {
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
  logger: true,
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
import { integer, jsonb, pgEnum, pgTable, real, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

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
  score: real(),
  chaptersCount: integer(),
  ...timestamps,
}, mangaTable => [
  {
    sourceUniqueIndex: uniqueIndex('manga_unique_source_idx').on(mangaTable.sourceName, mangaTable.sourceId),
  },
]);
export type MangaInsert = typeof mangaTable.$inferInsert;
export type Manga = typeof mangaTable.$inferSelect;

export const mangaRelations = relations(mangaTable, ({ many }) => ({
  userMangas: many(userMangaTable),
}));
```

---

lib/db/model/user.ts:

```ts
import { relations } from 'drizzle-orm';
import { index, integer, pgTable, primaryKey, real, text, timestamp } from 'drizzle-orm/pg-core';

import { timestamps } from '@/lib/db/model/helpers';
import { mangaTable } from '@/lib/db/model/manga';

export const userTable = pgTable('user', {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: timestamp({ mode: 'date' }),
  image: text(),
  telegramId: integer().notNull().unique(),

  ...timestamps,
}, userTable => [{
  telegramIdIdx: index('user_telegramId_idx').on(userTable.telegramId),
  emailIdx: index('client_email_idx').on(userTable.email),
}]);
export type UserInsert = typeof userTable.$inferInsert;
export type User = typeof userTable.$inferSelect;

export const userMangaTable = pgTable('user-manga', {
  userId: text()
    .references(() => userTable.id, { onDelete: 'cascade' })
    .notNull(),
  mangaId: text()
    .references(() => mangaTable.id, { onDelete: 'cascade' })
    .notNull(),

  lastReadChapter: real().notNull().default(0),

  ...timestamps,
}, userMangaTable => [
  primaryKey({ columns: [userMangaTable.userId, userMangaTable.mangaId] }),
]);
export type UserMangaInsert = typeof userMangaTable.$inferInsert;
export type UserManga = typeof userMangaTable.$inferSelect;

export const userRelations = relations(userTable, ({ many }) => ({
  userMangas: many(userMangaTable),
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

import type { MangaInsert } from '@/lib/db/model/manga';

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

export async function getManga(connectorName: string, id: string): Promise<MangaInsert> {
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
    "prepare": "husky",
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "test": "cross-env NODE_OPTIONS=--experimental-vm-modules jest",
    "test:coverage": "cross-env NODE_OPTIONS=--experimental-vm-modules jest --coverage",
    "lint": "eslint .",
    "lint:fix": "npm run lint -- --fix",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "export:code": "node -r esbuild-register script/export.ts"
  },
  "dependencies": {
    "@electric-sql/pglite": "^0.3.1",
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
    "@types/jest": "^29.5.14",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/ws": "^8.18.1",
    "cross-env": "^7.0.3",
    "dotenv": "^16.5.0",
    "drizzle-kit": "^0.31.1",
    "drizzle-orm": "^0.43.1",
    "esbuild-register": "^3.6.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "husky": "^9.1.7",
    "ignore": "^7.0.4",
    "jest": "^29.7.0",
    "ts-jest": "^29.3.2",
    "typescript": "^5"
  },
  "jest": {
    "testEnvironment": "node",
    "setupFilesAfterEnv": [
      "./test/setup.ts"
    ],
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/$1"
    },
    "transform": {
      "^.+.tsx?$": [
        "ts-jest",
        {}
      ]
    }
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
.husky
*.svg
*.ico
*.png
*.jpg
docs/EXPORT.md
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

const exportFilename = join(docFolder, 'EXPORT.md');
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

test/setup.ts:

```ts
import { resolve } from 'node:path';

import { PgTable } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';

import * as schema from '@/lib/db/model';

export const testDb = drizzle({ schema, logger: false });

jest.mock('@/lib/db', () => ({
  __esModule: true,
  db: testDb,
}));

async function applyMigrations() {
  const migrationsFolder = resolve(__dirname, '..', 'drizzle');

  await migrate(testDb, { migrationsFolder });
}

export async function resetDatabase() {
  await Object.values(schema)
    .filter(table => table instanceof PgTable)
    .reduce(async (promise, table) => {
      await promise;
      await testDb.delete(table);
    }, Promise.resolve());
}

beforeAll(async () => {
  await applyMigrations();
});

beforeEach(async () => {
  await resetDatabase();
});
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
