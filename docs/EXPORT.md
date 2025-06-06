# EXPORT

## File structure

```
manga-mailer
 ├── .editorconfig
 ├── .env
 ├─> .husky
 │   └── pre-commit
 ├─> .vscode
 │   └── settings.json
 ├── README.md
 ├─> app
 │   ├─> api
 │   │   └─> cron
 │   │       └─> manga-updates
 │   │           ├── route.test.ts
 │   │           └── route.ts
 │   └── route.ts
 ├─> docs
 │   ├── CONTRIBUTING.md
 │   ├── EXPORT.md
 │   ├── PROJECT_DETAILS.md
 │   └── TODO.md
 ├─> drizzle
 │   ├── 0000_vengeful_vision.sql
 │   ├── 0001_dear_lucky_pierre.sql
 │   ├── 0002_freezing_annihilus.sql
 │   ├── 0003_brave_lily_hollister.sql
 │   ├── 0004_graceful_speedball.sql
 │   ├── 0005_dashing_karen_page.sql
 │   └─> meta
 │       ├── 0000_snapshot.json
 │       ├── 0001_snapshot.json
 │       ├── 0002_snapshot.json
 │       ├── 0003_snapshot.json
 │       ├── 0004_snapshot.json
 │       ├── 0005_snapshot.json
 │       └── _journal.json
 ├── drizzle.config.ts
 ├─> e2e
 │   └── bot.test.ts
 ├── eslint.config.mjs
 ├── instrumentation.ts
 ├─> lib
 │   ├─> bot
 │   │   ├─> commands
 │   │   │   ├── help.test.ts
 │   │   │   ├── help.ts
 │   │   │   ├── list.test.ts
 │   │   │   ├── list.ts
 │   │   │   ├── remove.test.ts
 │   │   │   ├── remove.ts
 │   │   │   ├── signup.test.ts
 │   │   │   ├── signup.ts
 │   │   │   ├── track.test.ts
 │   │   │   └── track.ts
 │   │   ├── constants.ts
 │   │   ├── index.test.ts
 │   │   ├── index.ts
 │   │   └── types.ts
 │   ├─> db
 │   │   ├─> action
 │   │   │   ├── manga.test.ts
 │   │   │   ├── manga.ts
 │   │   │   ├── user.test.ts
 │   │   │   └── user.ts
 │   │   ├── index.ts
 │   │   └─> model
 │   │       ├── helpers.ts
 │   │       ├── index.ts
 │   │       ├── manga.ts
 │   │       └── user.ts
 │   ├── email.test.ts
 │   ├── email.ts
 │   ├── log.ts
 │   ├── manga.test.ts
 │   ├── manga.ts
 │   ├─> service
 │   │   ├── mangaUpdater.test.ts
 │   │   └── mangaUpdater.ts
 │   └─> validation
 │       ├── user.test.ts
 │       └── user.ts
 ├── next-env.d.ts
 ├── next.config.ts
 ├── package-lock.json
 ├── package.json
 ├─> public
 │   └── manga-mailer.png
 ├─> script
 │   └── export.ts
 ├─> test
 │   ├─> log
 │   │   └── index.ts
 │   ├─> mocks
 │   │   ├─> bot
 │   │   │   └── context.ts
 │   │   ├─> db
 │   │   │   ├── manga.ts
 │   │   │   └── user.ts
 │   │   ├── email.ts
 │   │   └── manga.ts
 │   └── setup.ts
 ├── tsconfig.json
 ├── vercel.json
 └── vitest.config.ts
```

## File export

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
    "database",
    "email",
    "updater"
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

app/api/cron/manga-updates/route.test.ts:

```ts
import type { Mock } from 'vitest';

import { NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { loggerWriteSpy } from '@/test/log';

import { GET } from './route';

const mockedMangaUpdater = vi.hoisted(() => vi.fn().mockResolvedValue({
  emailsSent: 0,
  updatedMangas: [],
  errors: [],
}));

vi.mock('@/lib/service/mangaUpdater', () => ({
  mangaUpdater: mockedMangaUpdater,
}));

vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      json: vi.fn((body, init) => ({
        json: async () => body,
        status: init?.status ?? 200,
        ok: (init?.status ?? 200) < 400,
      })),
    },
  };
});

const mockedNextResponseJson = NextResponse.json as Mock;

describe('aPI Route: /api/cron/manga-updates (GET)', () => {
  const originalCronSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = 'test-secret';
  });

  afterEach(() => {
    process.env.CRON_SECRET = originalCronSecret;
  });

  function createMockRequest(authorizationHeader?: string): Request {
    const headers = new Headers();
    if (typeof authorizationHeader !== 'undefined') {
      headers.set('authorization', authorizationHeader);
    }
    return {
      headers,
    } as Request;
  }

  it('should return 401 Unauthorized if CRON_SECRET is set and not provided or incorrect', async () => {
    const requestWithoutAuth = createMockRequest();
    await GET(requestWithoutAuth);
    expect(mockedNextResponseJson).toHaveBeenCalledWith({ error: 'Unauthorized' }, { status: 401 });

    expect(loggerWriteSpy).toHaveBeenCalledTimes(2);
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
      level: 'info',
      msg: 'Manga update cron job triggered.',
      serviceName: 'api:cron:manga-updates',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
      level: 'warn',
      msg: 'Unauthorized attempt to trigger cron job.',
      serviceName: 'api:cron:manga-updates',
    });

    const requestWithWrongAuth = createMockRequest('Bearer wrong-secret');
    await GET(requestWithWrongAuth);
    expect(mockedNextResponseJson).toHaveBeenCalledWith({ error: 'Unauthorized' }, { status: 401 });
  });

  it('should call mangaUpdater and return success if authorization is valid', async () => {
    const mockUpdaterResult = {
      emailsSent: 5,
      updatedMangas: [{ title: 'Manga X', chapters: [{ index: 1 }] }],
      errors: [],
    };
    mockedMangaUpdater.mockResolvedValue(mockUpdaterResult);
    const request = createMockRequest(`Bearer ${process.env.CRON_SECRET}`);

    await GET(request);

    expect(mockedMangaUpdater).toHaveBeenCalledTimes(1);
    expect(mockedNextResponseJson).toHaveBeenCalledWith({
      message: 'Manga update process finished.',
      details: {
        emailsSent: 5,
        updatedMangas: [{
          title: 'Manga X',
          chapters: [{ index: 1 }],
        }],
        errors: [],
      },
    });

    expect(loggerWriteSpy).toHaveBeenCalledTimes(3);
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
      level: 'info',
      msg: 'Manga update cron job triggered.',
      serviceName: 'api:cron:manga-updates',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
      level: 'info',
      msg: 'Starting mangaUpdater service...',
      serviceName: 'api:cron:manga-updates',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
      level: 'info',
      msg: 'Manga updater service finished.',
      emailsSent: 5,
      errorsCount: 0,
      updatedMangasCount: 1,
      serviceName: 'api:cron:manga-updates',
    });
  });

  it('should return 500 if mangaUpdater throws an error', async () => {
    const errorMessage = 'Updater failed catastrophically';
    mockedMangaUpdater.mockRejectedValue(new Error(errorMessage));
    const request = createMockRequest(`Bearer ${process.env.CRON_SECRET}`);

    await GET(request);

    expect(mockedMangaUpdater).toHaveBeenCalledTimes(1);
    expect(mockedNextResponseJson).toHaveBeenCalledWith(
      { error: 'Failed to run manga update process', details: errorMessage },
      { status: 500 },
    );

    expect(loggerWriteSpy).toHaveBeenCalledTimes(3);
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
      level: 'info',
      msg: 'Manga update cron job triggered.',
      serviceName: 'api:cron:manga-updates',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
      level: 'info',
      msg: 'Starting mangaUpdater service...',
      serviceName: 'api:cron:manga-updates',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
      error: expect.any(Object),
      level: 'error',
      msg: 'Critical error in manga update cron job API handler.',
      serviceName: 'api:cron:manga-updates',
    });
  });

  it('should proceed if CRON_SECRET is not set (environment without secret)', async () => {
    // @ts-expect-error I should delete the secret to see if the no-auth is handled correctly
    delete process.env.CRON_SECRET;
    mockedMangaUpdater.mockResolvedValue({ emailsSent: 0, updatedMangas: [], errors: [] });
    const request = createMockRequest();

    await GET(request);

    expect(mockedMangaUpdater).toHaveBeenCalledTimes(1);
    expect(mockedNextResponseJson).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Manga update process finished.' }),
    );

    expect(loggerWriteSpy).toHaveBeenCalledTimes(3);
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
      level: 'info',
      msg: 'Manga update cron job triggered.',
      serviceName: 'api:cron:manga-updates',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
      level: 'info',
      msg: 'Starting mangaUpdater service...',
      serviceName: 'api:cron:manga-updates',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
      level: 'info',
      msg: 'Manga updater service finished.',
      emailsSent: 0,
      errorsCount: 0,
      updatedMangasCount: 0,
      serviceName: 'api:cron:manga-updates',
    });
  });
});
```

---

app/api/cron/manga-updates/route.ts:

```ts
import { NextResponse } from 'next/server';

import { createChildLogger } from '@/lib/log';
import { mangaUpdater } from '@/lib/service/mangaUpdater';

declare global {

  namespace NodeJS {
    interface ProcessEnv {
      CRON_SECRET: string;
    }
  }
}

const logger = createChildLogger('api:cron:manga-updates');

export async function GET(request: Request) {
  logger.info('Manga update cron job triggered.');

  const CRON_SECRET = process.env.CRON_SECRET;
  const authorizationHeader = request.headers.get('authorization');
  if (CRON_SECRET && authorizationHeader !== `Bearer ${CRON_SECRET}`) {
    logger.warn('Unauthorized attempt to trigger cron job.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    logger.info('Starting mangaUpdater service...');
    const details = await mangaUpdater();
    logger.info({
      emailsSent: details.emailsSent,
      updatedMangasCount: details.updatedMangas.length,
      errorsCount: details.errors.length,
    }, 'Manga updater service finished.');

    return NextResponse.json({
      message: 'Manga update process finished.',
      details,
    });
  } catch (error) {
    logger.error({ error }, 'Critical error in manga update cron job API handler.');
    return NextResponse.json({ error: 'Failed to run manga update process', details: (error as Error).message }, { status: 500 });
  }
}
```

---

app/route.ts:

```ts
import { webhookCallback } from 'grammy';
import { NextResponse } from 'next/server';

import { createBot } from '@/lib/bot';
import { createChildLogger } from '@/lib/log';

const logger = createChildLogger('route:/');

const bot = createBot();

export const POST = webhookCallback(bot, 'std/http');

export async function GET() {
  try {
    const webhook = await bot.api.getWebhookInfo();

    return NextResponse.json({ webhook });
  } catch (error) {
    logger.error('Error while retrieving webhook');
    logger.debug(error);

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
*   Your environment details (e.g., Node.js version, OS, Vitest version).

## Suggesting Features

If you have an idea for a new feature or an improvement to an existing one, please [open an issue](<LINK_TO_YOUR_ISSUES_PAGE_ON_GITHUB_ETC>) to discuss it. This allows us to coordinate efforts and ensure the feature aligns with the project's goals.

## Development Setup

Please refer to the [README.md](../README.md#️-installation) for instructions on how to set up the development environment.
Unit tests are run using [Vitest](https://vitest.dev/).

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
5.  **Test your changes** thoroughly:
    *   Run unit tests: `npm test` (or `yarn test`).
    *   Ensure good test coverage: `npm run test:coverage` (or `yarn test:coverage`).
    *   Add new tests if you are adding new functionality or fixing a bug that wasn't covered.
6.  **Commit your changes** with a clear and descriptive commit message. We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification (scopes are defined in `.vscode/settings.json`).
    ```bash
    git commit -m "feat(bot): add new /settings command"
    # or
    # git commit -m "fix(database): resolve issue with manga chapter query"
    ```
7.  **Push your changes** to your forked repository:
    ```bash
    git push origin feature/your-feature-name
    ```
8.  **Open a Pull Request (PR)** from your branch in your fork to the `main` (or `develop`) branch of the original Manga Mailer repository.
    *   Provide a clear title and description for your PR.
    *   Reference any related issues (e.g., "Closes #123").
    *   Ensure all automated checks (linting, tests) pass.

## Coding Guidelines

*   **Follow ESLint rules**: Run `npm run lint` (or `yarn lint`) to check your code.
*   **TypeScript**: Use TypeScript's features appropriately for type safety and clarity.
*   **Clarity & Maintainability**: Write clear, understandable, and maintainable code. Add comments where necessary to explain complex logic.
*   **Database Migrations**: If you make changes to the database schema (`lib/db/model/`), you **must** generate a new migration file using `npm run db:generate` (or `yarn db:generate`). Do not edit migration files manually unless you know what you are doing. Commit the generated migration file with your changes.
*   **Logging**: Utilize the provided Pino logger (`lib/log/`) for structured logging. Use appropriate log levels (`debug`, `info`, `warn`, `error`).

## Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms. (You might want to add a `CODE_OF_CONDUCT.md` file, a common one is the Contributor Covenant).

Thank you for your contribution!
```

---

docs/PROJECT_DETAILS.md:

```md
# Manga Mailer Project Details

This document provides an in-depth look at the architecture, internal workings, and key components of the Manga Mailer project.

## 1. Introduction

Manga Mailer is an application built to allow users to track their favorite manga via a Telegram bot and receive email updates when new chapters are released. The system relies on a Telegram bot for user interaction, a Next.js backend for webhook handling and API endpoints, and a scheduled task for checking manga updates.

## 2. Architecture

The project primarily consists of:

*   **Telegram Bot (User Interface)**: Built with the `grammY` library, using the `@grammyjs/conversations` plugin for multi-step interactions.
*   **Backend (Next.js API Routes)**:
    *   Serves as the endpoint for Telegram's webhook (`app/route.ts`).
    *   Provides an API endpoint for scheduled cron jobs to trigger manga updates (`app/api/cron/manga-updates/route.ts`).
*   **Core Logic (`lib/`)**:
    *   Bot command handlers and conversation logic (`lib/bot/commands/`).
    *   Database interaction layer (Drizzle ORM actions in `lib/db/action/`).
    *   Manga scraping and data processing (`lib/manga.ts` using `@zweer/manga-scraper`).
    *   Email sending service (`lib/email.ts` using `nodemailer`).
    *   Manga update checking service (`lib/service/mangaUpdater.ts`).
    *   Structured logging (`lib/log/` using `pino`).
*   **Database (PostgreSQL)**:
    *   Managed with Drizzle ORM for schema definition (`lib/db/model/`), queries, and migrations.
    *   Stores user information, manga details (including chapters), and user-manga tracking data.
*   **Scheduled Tasks (Cron Jobs)**:
    *   Configured via Vercel Cron Jobs (`vercel.json`) to periodically trigger the manga update service.

### Typical Interaction Flow (User to Bot)

1.  User sends a message/command to the Telegram bot.
2.  Telegram forwards the update to the Next.js webhook endpoint (`app/route.ts`).
3.  `grammY` processes the update, activating command handlers or conversations.
4.  Handlers/conversations may interact with database actions or manga scraping services.
5.  The bot responds to the user via the Telegram API.

### Typical Flow (Scheduled Manga Update)

1.  Vercel Cron Job triggers the `/api/cron/manga-updates` endpoint at a scheduled interval.
2.  The API route handler invokes the `mangaUpdater` service.
3.  `mangaUpdater` service:
    a.  Fetches tracked manga and their latest chapter information from the database.
    b.  Uses `@zweer/manga-scraper` to get the newest chapter data from external sources.
    c.  Compares local data with fresh data to identify new chapters.
    d.  Updates the `mangaTable` and `chapterTable` in the database with new information.
    e.  Identifies users subscribed to manga with new chapters (and who haven't read them yet).
    f.  Uses `lib/email.ts` to send email notifications to relevant users.
4.  The API route returns a summary of the update process.

## 3. Telegram Bot Operation

(This section can remain largely the same as before, but ensure it mentions the `/remove` command.)

### 3.1. Initialization (`lib/bot/index.ts`)
*   `createBot()`: Initializes the `grammY` bot instance, registers the `conversations` plugin, and sets up handlers for all defined commands (`/start`, `/track`, `/list`, `/remove`, `/help`) and a generic message fallback.

### 3.2. Main Commands
*   **`/start`**: Initiates the `signupConversationLogic` for user registration.
*   **`/track`**: Initiates the `trackConversationLogic` to search and track new manga.
*   **`/list`**: Directly lists manga tracked by the user via `createListConversation`.
*   **`/remove`**: Initiates the `removeConversationLogic` to allow users to select and untrack manga.
*   **`/help`**: Displays a help message with command descriptions via `createHelpMessage`.

## 4. Database (Drizzle ORM)

### 4.1. Main Tables
*   **`userTable`**: Stores user profiles.
*   **`mangaTable`**: Stores manga metadata, including `chaptersCount` and `lastCheckedAt`.
*   **`chapterTable` (New)**: Stores individual chapter details for each manga (ID, source ID, manga ID, title, index, URL, release date, images). This allows for more granular tracking and notification.
*   **`userMangaTable`**: Join table for the many-to-many relationship between users and manga, now including `lastReadChapter` to track user progress.

### 4.2. Database Actions (`lib/db/action/`)
*   `user.ts`: `upsertUser`, `findUserByTelegramId`.
*   `manga.ts`: `trackManga`, `listTrackedMangas`, `removeTrackedManga`. (Database actions for `chapterTable` might be implicitly handled by `mangaUpdater` or could be separate if needed).

## 5. Manga Update Service (`lib/service/mangaUpdater.ts`)
*   **`mangaUpdater()`**: Orchestrates the entire update process.
    *   `checkMangasForUpdates()`:
        *   Fetches tracked manga.
        *   For each manga, uses `getManga()` and `getChapters()` (from `lib/manga.ts`) to get the latest data from the source.
        *   Compares chapter counts and individual chapters against `chapterTable`.
        *   Updates `mangaTable` (e.g., `chaptersCount`, `lastCheckedAt`) and inserts new chapters into `chapterTable`.
    *   `retrieveUsersForUpdates()`: Queries `userMangaTable` and `userTable` to find users who are tracking updated manga and whose `lastReadChapter` is less than the newest available chapter index.
    *   `notifyUsersForUpdates()`:
        *   Iterates through users પાણી be notified and the new chapters for their tracked manga.
        *   Constructs and sends an email notification using `sendEmail()` from `lib/email.ts`.

## 6. Email Service (`lib/email.ts`)
*   Uses `nodemailer` to send emails.
*   Configured via environment variables for an SMTP provider (Mailtrap for development/testing).
*   Provides a `sendEmail` function for dispatching emails.

## 7. Testing
*   Unit tests are written using **Vitest**.
*   **PGLite** is used for an in-memory PostgreSQL-compatible database during tests.
*   Helper utilities for mocking bot contexts and database actions are located in `test/mocks/`.
*   A global logger spy (`loggerWriteSpy`) is used for asserting log outputs, configured via a manual mock in `test/setup.ts` activating `lib/log/__mocks__/index.ts`.

## 8. Deployment & Scheduling
*   The Next.js application (including the bot webhook) is designed for deployment on **Vercel**.
*   The `instrumentation.ts` file handles webhook registration in production on Vercel.
*   Scheduled tasks (manga updates) are managed using **Vercel Cron Jobs**, defined in `vercel.json`, which trigger an API endpoint.
```

---

docs/TODO.md:

```md
# TODO & Future Enhancements

This file tracks planned tasks, features, and improvements for the Manga Mailer project.

## ✅ Completed (MVP Reached)

*   [x] **User Registration** (`/start` conversation)
*   [x] **Manga Tracking** (`/track` conversation)
    *   [x] Search manga from multiple sources
    *   [x] Select manga for tracking
    *   [x] Store last read chapter
*   [x] **List Tracked Manga** (`/list` command)
*   [x] **Remove Tracked Manga** (`/remove` conversation)
*   [x] **Help Command** (`/help`)
*   [x] **Fallback Message Handler** for unknown messages
*   [x] **Database Setup** (PostgreSQL with Drizzle ORM)
    *   [x] User, Manga, Chapter, UserManga tables
*   [x] **Email Sending Service** (`lib/email.ts` with Nodemailer & Mailtrap)
*   [x] **Manga Update Service (`mangaUpdater`)**
    *   [x] Fetches latest manga and chapter data
    *   [x] Compares with DB to find new chapters
    *   [x] Updates manga and chapter info in DB
    *   [x] Identifies users needing notification (based on `lastReadChapter`)
    *   [x] Sends email notifications for new chapters
*   [x] **Scheduled Task Execution** (Vercel Cron Job triggering API endpoint)
*   [x] **Structured Logging** (Pino with child loggers)
*   [x] **Comprehensive Unit Test Suite** (Vitest, PGLite, Mocking helpers)

## 🎯 Next Steps & MVP Refinements (v1.1 -> v1.x)

### 🤖 Bot Experience & Features
*   [ ] **Refine `/track` flow**:
    *   [ ] Allow users to confirm manga details (author, status, etc.) before finalizing tracking.
    *   [ ] Better handling for too many `searchMangas` results (e.g., pagination, more specific search prompts).
*   [ ] **Command: `/setchapter [manga_query] [chapter_number]`**:
    *   Allow users to manually update their `lastReadChapter` for a specific manga.
    *   Requires a way to resolve `manga_query` to a specific tracked manga (could be a mini-conversation if ambiguous).
*   [ ] **Refine User Onboarding (`/start`)**:
    *   [ ] Consider allowing users to update their email or name separately after initial signup (e.g., via a `/settings` command).
*   [ ] **Improve Error Handling & User Feedback**:
    *   More specific error messages from the bot.
    *   Clearer guidance if user input is malformed.
*   [ ] **Handle `/cancel` Consistently in All Conversations.**

### 📧 Email Notifications
*   [ ] **Enhanced Email Templates**:
    *   Use more structured HTML (e.g., with `mjml` or similar).
    *   Include manga cover image in notification emails.
    *   Clearer call-to-action buttons/links.
*   [ ] **Group Notifications**: If a manga has multiple new chapters, send a single summary email per manga update cycle, rather than one email per chapter.
*   [ ] **Direct Chapter Links in Emails**: If feasible based on scraper data, provide direct links to new chapters.

### ⚙️ Backend, Services & Operations
*   [ ] **Manga Update Service (`mangaUpdater`) Optimizations**:
    *   **Scraper Rate Limiting**: Implement delays between calls to `getManga`/`getChapters` for different manga to be a good web citizen.
    *   **Error Resilience (Scraper):** More robust handling if a specific manga source is down or changes format (e.g., temporary skip, mark manga as "needs attention").
    *   **Efficiency:** Review DB queries for fetching tracked manga and users to ensure they scale well.
*   [ ] **Production Email Provider**: Transition from Mailtrap to a production-ready email provider (Resend, SendGrid, AWS SES, etc.) and update environment variables.
*   [ ] **Database Indexing Review**: Periodically review query performance and add/tweak DB indexes as data grows.

### 🧪 Testing
*   [ ] **(Ongoing) Maintain High Unit Test Coverage** for new features and refactors.
*   [ ] **(Future) Basic E2E Tests**: Once core features are very stable, explore simple E2E tests for key user flows (e.g., using local bot instance tests as a starting point).

## 🌟 Longer-Term Vision (v2.0+)

*   [ ] **User Settings Command (`/settings`)**:
    *   [ ] View/Change notification email.
    *   [ ] Pause/Resume all notifications.
    *   [ ] Pause/Resume notifications for specific manga.
    *   [ ] Set notification frequency preferences (if applicable).
*   [ ] **Advanced Chapter Data in Emails**: If `chapterTable` stores chapter titles, include them in notification emails.
*   [ ] **Web Interface (Optional Frontend)**:
    *   User dashboard to manage tracked manga, view notification history, update settings.
*   [ ] **Support for More Manga Sources**: If `@zweer/manga-scraper` adds new connectors or if you integrate others.
*   [ ] **Internationalization (i18n)** for bot messages.
*   [ ] **Admin Dashboard/Monitoring Tools.**
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

e2e/bot.test.ts:

```ts
import type { Api } from 'grammy';
import type { Update, UserFromGetMe } from 'grammy/types';

import type { BotType } from '@/lib/bot/types';

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

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

describe.skip('bot E2E-like Tests', () => {
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
      const upsertUserSpy = vi.spyOn(userActions, 'upsertUser');

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
import { createChildLogger } from '@/lib/log';

const logger = createChildLogger('instrumentation');

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
  logger.debug('[setTelegramWebhook] setting new endpoint:', endpoint);

  try {
    await bot.api.setWebhook(endpoint);
    logger.debug('[setTelegramWebhook] ✅ endpoint set successfully!');
  } catch (error) {
    logger.error('[setTelegramWebhook] ❌ endpoint set error!');
    logger.debug(error);
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

lib/bot/commands/help.test.ts:

```ts
import type { CommandContext } from 'grammy';

import type { BotContext, BotType } from '@/lib/bot/types';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createHelpMessage } from '@/lib/bot/commands/help';
import { loggerWriteSpy } from '@/test/log';
import { createMockCommandContext } from '@/test/mocks/bot/context';

describe('bot -> commands -> help', () => {
  let helpHandler: ((ctx: CommandContext<BotContext>) => Promise<void>);

  const mockBotInstance: Partial<BotType> = {
    command: vi.fn((commandName, handler) => {
      if (commandName === 'help') {
        helpHandler = handler;
      }
    }) as any,
  };

  beforeEach(() => {
    createHelpMessage(mockBotInstance as BotType);

    if (!helpHandler) {
      throw new Error('Help handler was not registered');
    }
  });

  it('should register a "help" command handler on the bot', () => {
    expect(mockBotInstance.command).toHaveBeenCalledWith('help', expect.any(Function));
  });

  it('should reply with a formatted list of commands when the /help handler is invoked', async () => {
    const context = createMockCommandContext('/help');

    expect(helpHandler).toBeDefined();

    await helpHandler(context);

    const exppectedHelpMessage = `⚙️ *Commands*:

• /start \\- Signup to the bot, providing name and email address
• /track \\- Track a new manga
• /list \\- List all the manga you are tracking
• /remove \\- Remove a tracked manga`;
    expect(context.reply).toHaveBeenCalledWith(exppectedHelpMessage, { parse_mode: 'MarkdownV2' });

    expect(loggerWriteSpy).toHaveBeenCalledTimes(1);
    expect(loggerWriteSpy).toHaveBeenLastCalledWith({
      level: 'debug',
      serviceName: 'bot:command:help',
      msg: 'Received /help command',
      userId: context.from?.id,
    });
  });
});
```

---

lib/bot/commands/help.ts:

```ts
import type { BotType } from '@/lib/bot/types';

import { commands } from '@/lib/bot/constants';
import { createChildLogger } from '@/lib/log';

const logger = createChildLogger('bot:command:help');

export function createHelpMessage(bot: BotType) {
  const commandDescriptions = commands.map(({ command, description }) => `• /${command} \\- ${description}`).join('\n');

  bot.command('help', async (ctx) => {
    logger.debug({ userId: ctx.from?.id }, 'Received /help command');

    await ctx.reply(
      `⚙️ *Commands*:

${commandDescriptions}`,
      { parse_mode: 'MarkdownV2' },
    );
  });
}
```

---

lib/bot/commands/list.test.ts:

```ts
import type { CommandContext } from 'grammy';

import type { BotContext, BotType } from '@/lib/bot/types';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createListConversation } from '@/lib/bot/commands/list';
import { loggerWriteSpy } from '@/test/log';
import { createMockCommandContext } from '@/test/mocks/bot/context';
import { mockedListTrackedMangas, mockListTrackedMangasSuccess } from '@/test/mocks/db/manga';
import { mockedFindUserByTelegramId, mockFindUserByTelegramIdNotFound, mockFindUserByTelegramIdSuccess } from '@/test/mocks/db/user';

vi.mock('@/lib/db/action/manga', () => ({
  listTrackedMangas: vi.fn(),
  removeTrackedManga: vi.fn(),
  trackManga: vi.fn(),
}));
vi.mock('@/lib/db/action/user', () => ({
  findUserByTelegramId: vi.fn(),
  upsertUser: vi.fn(),
}));

describe('bot -> commands -> list', () => {
  let listHandler: ((ctx: CommandContext<BotContext>) => Promise<void>);
  const mockBotInstance: Partial<BotType> = {
    command: vi.fn((commandName, handler) => {
      if (commandName === 'list') {
        listHandler = handler;
      }
    }) as any,
  };

  beforeEach(() => {
    createListConversation(mockBotInstance as BotType);

    if (!listHandler) {
      throw new Error('List handler was not registered');
    }
  });

  it('should register a "list" command handler on the bot', () => {
    expect(mockBotInstance.command).toHaveBeenCalledWith('list', expect.any(Function));
  });

  it('should prompt user to signup if user is not found', async () => {
    const context = createMockCommandContext('/list');
    mockFindUserByTelegramIdNotFound();

    await listHandler(context);

    expect(mockedFindUserByTelegramId).toHaveBeenCalledWith(context.from?.id);
    expect(context.reply).toHaveBeenCalledTimes(1);
    expect(context.reply).toHaveBeenLastCalledWith('You need to /start and register before you can remove manga.');

    expect(loggerWriteSpy).toHaveBeenCalledTimes(1);
    expect(loggerWriteSpy).toHaveBeenLastCalledWith({
      level: 'debug',
      serviceName: 'bot:command:list',
      msg: 'Received /list command',
      userId: context.from?.id,
    });
  });

  it('should inform user if they are tracking no mangas', async () => {
    const context = createMockCommandContext('/list');

    const user = mockFindUserByTelegramIdSuccess();
    mockListTrackedMangasSuccess([]);

    await listHandler(context);

    expect(mockedFindUserByTelegramId).toHaveBeenCalledWith(context.from?.id);
    expect(mockedListTrackedMangas).toHaveBeenCalledWith(user.id);
    expect(context.reply).toHaveBeenCalledWith('You\'re not tracking any manga yet: tap /track to track your first manga');
    expect(context.conversation.enter).not.toHaveBeenCalled();

    expect(loggerWriteSpy).toHaveBeenCalledTimes(1);
    expect(loggerWriteSpy).toHaveBeenLastCalledWith({
      level: 'debug',
      serviceName: 'bot:command:list',
      msg: 'Received /list command',
      userId: context.from?.id,
    });
  });

  it('should list tracked mangas if user and mangas exist', async () => {
    const context = createMockCommandContext('/list');
    const trackedMangas = [
      { title: 'Manga Alpha', chaptersCount: 10 },
      { title: 'Manga Beta', chaptersCount: 25 },
    ];

    const user = mockFindUserByTelegramIdSuccess();
    mockListTrackedMangasSuccess(trackedMangas);

    await listHandler(context);

    expect(mockedFindUserByTelegramId).toHaveBeenCalledWith(context.from?.id);
    expect(mockedListTrackedMangas).toHaveBeenCalledWith(user.id);

    const expectedReplyMessage = `Here is what you're currently tracking:\n\n${
      trackedMangas.map(manga => `• ${manga.title} (${manga.chaptersCount})`).join('\n')
    }`;
    expect(context.reply).toHaveBeenCalledWith(expectedReplyMessage);
    expect(context.conversation.enter).not.toHaveBeenCalled();

    expect(loggerWriteSpy).toHaveBeenCalledTimes(2);
    expect(loggerWriteSpy).toHaveBeenLastCalledWith({
      level: 'debug',
      serviceName: 'bot:command:list',
      userId: context.from?.id,
      trackedMangas: 2,
    });
  });
});
```

---

lib/bot/commands/list.ts:

```ts
import type { BotType } from '@/lib/bot/types';

import { listTrackedMangas } from '@/lib/db/action/manga';
import { findUserByTelegramId } from '@/lib/db/action/user';
import { createChildLogger } from '@/lib/log';

const logger = createChildLogger('bot:command:list');

export function createListConversation(bot: BotType) {
  bot.command('list', async (ctx) => {
    logger.debug({ userId: ctx.from?.id }, 'Received /list command');
    const user = await findUserByTelegramId(ctx.from!.id);

    if (!user) {
      await ctx.reply('You need to /start and register before you can remove manga.');
      return;
    }

    const mangas = await listTrackedMangas(user.id);

    if (mangas.length === 0) {
      await ctx.reply('You\'re not tracking any manga yet: tap /track to track your first manga');
      return;
    }

    logger.debug({ userId: ctx.from?.id, trackedMangas: mangas.length });
    await ctx.reply(`Here is what you're currently tracking:\n\n${
      mangas.map(manga => `• ${manga.title} (${manga.chaptersCount})`).join('\n')
    }`);
  });
}
```

---

lib/bot/commands/remove.test.ts:

```ts
import type { Conversation } from '@grammyjs/conversations';
import type { Mock, Mocked } from 'vitest';

import type { BotContext, BotType } from '@/lib/bot/types';
import type { Manga, User } from '@/lib/db/model';
import type {
  MockCommandContext,
} from '@/test/mocks/bot/context';

import { InlineKeyboard } from 'grammy';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { createRemoveConversation, removeConversationLogic } from '@/lib/bot/commands/remove';
import { removeConversationId } from '@/lib/bot/constants';
import { loggerWriteSpy } from '@/test/log';
import {
  createMockCallbackQueryContext,
  createMockCommandContext,
} from '@/test/mocks/bot/context';
import {
  mockedListTrackedMangas,
  mockedRemoveTrackedManga,
  mockListTrackedMangasSuccess,
  mockRemoveTrackedMangaDbError,
  mockRemoveTrackedMangaSuccess,
} from '@/test/mocks/db/manga';
import { mockedFindUserByTelegramId, mockFindUserByTelegramIdSuccess } from '@/test/mocks/db/user';

vi.mock('@/lib/db/action/manga', () => ({
  listTrackedMangas: vi.fn(),
  removeTrackedManga: vi.fn(),
  trackManga: vi.fn(),
}));
vi.mock('@/lib/db/action/user', () => ({
  findUserByTelegramId: vi.fn(),
  upsertUser: vi.fn(),
}));

describe('bot -> commands -> remove', () => {
  let removeCommandHandler: ((ctx: MockCommandContext) => Promise<void>);

  const mockBotInstance: Partial<BotType> = {
    command: vi.fn((commandName, handler) => {
      if (commandName === 'remove') {
        removeCommandHandler = handler;
      }
    }) as any,
    use: vi.fn().mockReturnThis(),
  };

  beforeAll(() => {
    createRemoveConversation(mockBotInstance as BotType);
  });

  beforeEach(() => {
    vi.clearAllMocks();

    if (!removeCommandHandler) {
      throw new Error('/remove command handler not registered');
    }
  });

  describe('command Handler: /remove', () => {
    it('should enter signupConversation if user does not exist', async () => {
      const context = createMockCommandContext('/remove');

      await removeCommandHandler(context);

      expect(mockedFindUserByTelegramId).toHaveBeenCalledWith(context.from?.id);
      expect(context.reply).toHaveBeenCalledWith('You need to /start and register before you can remove manga.');
      expect(context.conversation.enter).not.toHaveBeenCalled();

      expect(loggerWriteSpy).toHaveBeenCalledTimes(1);
      expect(loggerWriteSpy).toHaveBeenLastCalledWith({
        level: 'debug',
        serviceName: 'bot:command:remove',
        msg: 'Received /remove command',
        userId: context.from?.id,
      });
    });

    it('should enter removeManga conversation if user exists and has no tracked mangas', async () => {
      const user = mockFindUserByTelegramIdSuccess();
      const trackedMangas = mockListTrackedMangasSuccess([]);
      const context = createMockCommandContext('/remove');

      await removeCommandHandler(context);

      expect(mockedFindUserByTelegramId).toHaveBeenCalledWith(context.from?.id);
      expect(mockedListTrackedMangas).toHaveBeenCalledWith(user.id);
      expect(context.conversation.enter).toHaveBeenCalledWith(removeConversationId, user, trackedMangas);

      expect(loggerWriteSpy).toHaveBeenCalledTimes(1);
      expect(loggerWriteSpy).toHaveBeenLastCalledWith({
        level: 'debug',
        serviceName: 'bot:command:remove',
        msg: 'Received /remove command',
        userId: context.from?.id,
      });
    });

    it('should enter removeManga conversation if user exists and has tracked mangas', async () => {
      const user = mockFindUserByTelegramIdSuccess();
      const trackedMangas = mockListTrackedMangasSuccess([{}, {}]);
      const context = createMockCommandContext('/remove');

      await removeCommandHandler(context);

      expect(mockedFindUserByTelegramId).toHaveBeenCalledWith(context.from?.id);
      expect(mockedListTrackedMangas).toHaveBeenCalledWith(user.id);
      expect(context.conversation.enter).toHaveBeenCalledWith(removeConversationId, user, trackedMangas);

      expect(loggerWriteSpy).toHaveBeenCalledTimes(1);
      expect(loggerWriteSpy).toHaveBeenLastCalledWith({
        level: 'debug',
        serviceName: 'bot:command:remove',
        msg: 'Received /remove command',
        userId: context.from?.id,
      });
    });
  });

  describe('conversation Logic: removeConversationLogic', () => {
    let mockConversationControls: Mocked<Conversation>;
    let context: BotContext;
    let user: User;

    beforeEach(() => {
      mockConversationControls = {
        waitFor: vi.fn(),
        external: vi.fn(async (callback: () => any) => callback()),
        log: vi.fn(),
        skip: vi.fn(),
        wait: vi.fn().mockResolvedValue(undefined),
        session: {} as any,
        __flavor: undefined as any,
      } as any;

      user = mockFindUserByTelegramIdSuccess();

      context = createMockCommandContext('/remove') as BotContext;
    });

    it('should inform user if they are not tracking any manga (inside conversation)', async () => {
      const trackedMangas = mockListTrackedMangasSuccess([]);

      await removeConversationLogic(mockConversationControls, context, user, trackedMangas);

      const replyMock = context.reply as Mock;
      expect(replyMock).toHaveBeenCalledWith('You\'re not tracking any manga right now. Nothing to remove!');
      expect(mockConversationControls.waitFor).not.toHaveBeenCalled();
    });

    describe('user has trackedMangas', () => {
      let trackedMangas: Manga[];

      beforeEach(() => {
        trackedMangas = mockListTrackedMangasSuccess([{}, {}]);
      });

      it('happy Path: should list mangas, user selects one, confirms, and manga is removed', async () => {
        mockRemoveTrackedMangaSuccess();

        const mangaToRemove = trackedMangas[0];
        const callbackDataSelectManga = `remove:${mangaToRemove.id}`;
        const callbackDataConfirmRemove = `confirm_remove:${mangaToRemove.id}`;

        mockConversationControls.waitFor
          .mockResolvedValueOnce(createMockCallbackQueryContext(callbackDataSelectManga, context.chat?.id, user.telegramId, context.message) as any)
          .mockResolvedValueOnce(createMockCallbackQueryContext(callbackDataConfirmRemove, context.chat?.id, user.telegramId, context.message) as any);

        await removeConversationLogic(mockConversationControls, context, user, trackedMangas);

        const replyMock = context.reply as Mock;
        const editMessageTextMock = (context as any).editMessageText as Mock;
        const answerCallbackQueryMock = (context as any).answerCallbackQuery as Mock;

        const expectedKeyboard = new InlineKeyboard();
        trackedMangas.forEach(m => expectedKeyboard.text(`❌ ${m.title} (${m.chaptersCount})`, `remove:${m.id}`).row());
        expectedKeyboard.text('🚫 Cancel Operation', 'cancel_remove').row();
        expect(replyMock).toHaveBeenCalledWith('Which manga do you want to stop tracking? Select from the list below:', {
          reply_markup: expectedKeyboard,
        });

        const confirmationKeyboard = new InlineKeyboard()
          .text(`✅ Yes, remove "${mangaToRemove.title}"`, `confirm_remove:${mangaToRemove.id}`)
          .text('❌ No, keep it', 'cancel_remove_confirm')
          .row();
        expect(editMessageTextMock).toHaveBeenNthCalledWith(1, `Are you sure you want to stop tracking "${mangaToRemove.title}"?`, {
          reply_markup: confirmationKeyboard,
        });

        expect(mockedRemoveTrackedManga).toHaveBeenCalledWith(user.id, mangaToRemove.id);

        expect(answerCallbackQueryMock).toHaveBeenCalledWith(`"${mangaToRemove.title}" removed!`);
        expect(editMessageTextMock).toHaveBeenNthCalledWith(2, `Successfully stopped tracking "${mangaToRemove.title}".`, { reply_markup: undefined });

        expect(loggerWriteSpy).toHaveBeenCalledTimes(2);
        expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
          level: 'debug',
          serviceName: 'bot:command:remove',
          msg: 'Entered remove conversation',
        });
        expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
          level: 'info',
          serviceName: 'bot:command:remove',
          msg: 'User removed manga tracking',
          mangaId: 'manga-id-123',
          title: 'Epic Adventure Manga',
          userId: 'test-user-id',
        });
      });

      it('should handle user cancelling at manga selection', async () => {
        const callbackDataCancel = 'cancel_remove';
        mockConversationControls.waitFor
          .mockResolvedValueOnce(createMockCallbackQueryContext(callbackDataCancel, context.chat?.id, user.telegramId, context.message) as any);

        await removeConversationLogic(mockConversationControls, context, user, trackedMangas);

        const editMessageTextMock = (context as any).editMessageText as Mock;
        const answerCallbackQueryMock = (context as any).answerCallbackQuery as Mock;
        expect(answerCallbackQueryMock).toHaveBeenCalledWith('Operation cancelled.');
        expect(editMessageTextMock).toHaveBeenCalledWith('Manga removal cancelled.', { reply_markup: undefined });
        expect(mockedRemoveTrackedManga).not.toHaveBeenCalled();

        expect(loggerWriteSpy).toHaveBeenCalledTimes(1);
        expect(loggerWriteSpy).toHaveBeenLastCalledWith({
          level: 'debug',
          serviceName: 'bot:command:remove',
          msg: 'Entered remove conversation',
        });
      });

      it('should handle user cancelling at confirmation step', async () => {
        const mangaToRemove = trackedMangas[0];
        const callbackDataSelectManga = `remove:${mangaToRemove.id}`;
        const callbackDataCancelConfirm = 'cancel_remove_confirm';

        mockConversationControls.waitFor
          .mockResolvedValueOnce(createMockCallbackQueryContext(callbackDataSelectManga, context.chat?.id, user.telegramId, context.message) as any)
          .mockResolvedValueOnce(createMockCallbackQueryContext(callbackDataCancelConfirm, context.chat?.id, user.telegramId, context.message) as any);

        await removeConversationLogic(mockConversationControls, context, user, trackedMangas);

        const editMessageTextMock = (context as any).editMessageText as Mock;
        const answerCallbackQueryMock = (context as any).answerCallbackQuery as Mock;

        expect(answerCallbackQueryMock).toHaveBeenCalledWith('Removal cancelled.');
        expect(editMessageTextMock).toHaveBeenLastCalledWith(`Ok, "${mangaToRemove.title}" will remain in your tracking list.`, { reply_markup: undefined });
        expect(mockedRemoveTrackedManga).not.toHaveBeenCalled();

        expect(loggerWriteSpy).toHaveBeenCalledTimes(1);
        expect(loggerWriteSpy).toHaveBeenLastCalledWith({
          level: 'debug',
          serviceName: 'bot:command:remove',
          msg: 'Entered remove conversation',
        });
      });

      it('should handle database error when removeTrackedManga fails', async () => {
        mockRemoveTrackedMangaDbError();

        const mangaToRemove = trackedMangas[0];
        const callbackDataSelectManga = `remove:${mangaToRemove.id}`;
        const callbackDataConfirmRemove = `confirm_remove:${mangaToRemove.id}`;

        mockConversationControls.waitFor
          .mockResolvedValueOnce(createMockCallbackQueryContext(callbackDataSelectManga, context.chat?.id, user.telegramId, context.message) as any)
          .mockResolvedValueOnce(createMockCallbackQueryContext(callbackDataConfirmRemove, context.chat?.id, user.telegramId, context.message) as any);

        await removeConversationLogic(mockConversationControls, context, user, trackedMangas);

        const editMessageTextMock = (context as any).editMessageText as Mock;
        const answerCallbackQueryMock = (context as any).answerCallbackQuery as Mock;

        expect(answerCallbackQueryMock).toHaveBeenCalledWith('Error!');
        expect(editMessageTextMock).toHaveBeenLastCalledWith('Could not remove manga tracking due to an error. Please try again later.', { reply_markup: undefined });

        expect(loggerWriteSpy).toHaveBeenCalledTimes(2);
        expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
          level: 'debug',
          serviceName: 'bot:command:remove',
          msg: 'Entered remove conversation',
        });
        expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
          level: 'error',
          serviceName: 'bot:command:remove',
          msg: 'Failed to remove manga tracking',
          error: 'DB error',
          mangaId: 'manga-id-123',
          userId: 'test-user-id',
        });
      });
    });
  });
});
```

---

lib/bot/commands/remove.ts:

```ts
import type { Conversation } from '@grammyjs/conversations';
import type { Context } from 'grammy';

import type { BotContext, BotType } from '@/lib/bot/types';
import type { Manga, User } from '@/lib/db/model';

import { createConversation } from '@grammyjs/conversations';
import { InlineKeyboard } from 'grammy';

import { removeConversationId } from '@/lib/bot/constants';
import { listTrackedMangas, removeTrackedManga } from '@/lib/db/action/manga';
import { findUserByTelegramId } from '@/lib/db/action/user';
import { createChildLogger } from '@/lib/log';

const logger = createChildLogger('bot:command:remove');

export async function removeConversationLogic(
  conversation: Conversation,
  ctx: Context,
  user: User,
  trackedMangas: Manga[],
) {
  logger.debug('Entered remove conversation');

  if (trackedMangas.length === 0) {
    await ctx.reply('You\'re not tracking any manga right now. Nothing to remove!');
    return;
  }

  const keyboard = new InlineKeyboard();
  trackedMangas.forEach((manga) => {
    keyboard.text(`❌ ${manga.title} (${manga.chaptersCount})`, `remove:${manga.id}`).row();
  });
  keyboard.text('🚫 Cancel Operation', 'cancel_remove').row();

  await ctx.reply('Which manga do you want to stop tracking? Select from the list below:', {
    reply_markup: keyboard,
  });

  const answer = await conversation.waitFor('callback_query:data');
  const callbackData = answer.callbackQuery.data;

  if (callbackData === 'cancel_remove') {
    await ctx.answerCallbackQuery('Operation cancelled.');
    await ctx.editMessageText('Manga removal cancelled.', { reply_markup: undefined });
    return;
  }

  if (!callbackData.startsWith('remove:')) {
    await ctx.answerCallbackQuery('Invalid selection.');
    await ctx.editMessageText('Invalid selection. Please try /remove again.', { reply_markup: undefined });
    return;
  }

  const mangaIdToRemove = callbackData.substring('remove:'.length);
  const mangaToRemove = trackedMangas.find(m => m.id === mangaIdToRemove);

  if (!mangaToRemove) {
    await ctx.answerCallbackQuery('Manga not found in your list.');
    await ctx.editMessageText('Selected manga not found in your list. Please try /remove again.', { reply_markup: undefined });
    return;
  }

  const confirmationKeyboard = new InlineKeyboard()
    .text(`✅ Yes, remove "${mangaToRemove.title}"`, `confirm_remove:${mangaIdToRemove}`)
    .text('❌ No, keep it', 'cancel_remove_confirm')
    .row();

  await ctx.editMessageText(`Are you sure you want to stop tracking "${mangaToRemove.title}"?`, {
    reply_markup: confirmationKeyboard,
  });

  const confirmationAnswer = await conversation.waitFor('callback_query:data');
  const confirmationData = confirmationAnswer.callbackQuery.data;

  if (confirmationData === 'cancel_remove_confirm') {
    await ctx.answerCallbackQuery('Removal cancelled.');
    await ctx.editMessageText(`Ok, "${mangaToRemove.title}" will remain in your tracking list.`, { reply_markup: undefined });
    return;
  }

  if (confirmationData.startsWith(`confirm_remove:${mangaIdToRemove}`)) {
    const removeResult = await conversation.external(async () => removeTrackedManga(user.id, mangaIdToRemove));
    if (removeResult.success) {
      await ctx.answerCallbackQuery(`"${mangaToRemove.title}" removed!`);
      await ctx.editMessageText(`Successfully stopped tracking "${mangaToRemove.title}".`, { reply_markup: undefined });
      logger.info({ userId: user.id, mangaId: mangaIdToRemove, title: mangaToRemove.title }, 'User removed manga tracking');
    } else {
      await ctx.answerCallbackQuery('Error!');
      await ctx.editMessageText('Could not remove manga tracking due to an error. Please try again later.', { reply_markup: undefined });
      logger.error({ error: removeResult.databaseError, userId: user.id, mangaId: mangaIdToRemove }, 'Failed to remove manga tracking');
    }
  } else {
    await ctx.answerCallbackQuery('Invalid confirmation.');
    await ctx.editMessageText('Invalid confirmation. Removal cancelled.', { reply_markup: undefined });
  }
}

export function createRemoveConversation(bot: BotType) {
  bot.use(createConversation(removeConversationLogic, {
    id: removeConversationId,
  }));

  bot.command('remove', async (ctx: BotContext) => {
    logger.debug({ userId: ctx.from?.id }, 'Received /remove command');
    const user = await findUserByTelegramId(ctx.from!.id);

    if (!user) {
      await ctx.reply('You need to /start and register before you can remove manga.');
      return;
    }

    const trackedMangas = await listTrackedMangas(user.id);

    await ctx.conversation.enter(removeConversationId, user, trackedMangas);
  });
}
```

---

lib/bot/commands/signup.test.ts:

```ts
import type { Mock } from 'vitest';

import type { BotType } from '@/lib/bot/types';
import type { MockCommandContext } from '@/test/mocks/bot/context';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createSignupConversation, signupConversationLogic } from '@/lib/bot/commands/signup';
import { signupConversationId } from '@/lib/bot/constants';
import { loggerWriteSpy } from '@/test/log';
import { createMockCommandContext, createMockConversationControl, createMockMessageContext } from '@/test/mocks/bot/context';
import { mockedUpsertUser, mockUpsertUserSuccess } from '@/test/mocks/db/user';

vi.mock('@/lib/db/action/user', () => ({
  findUserByTelegramId: vi.fn(),
  upsertUser: vi.fn(),
}));

describe('bot -> commands -> signup', () => {
  let startCommandHandler: ((ctx: MockCommandContext) => Promise<void>);

  const mockBotInstance: Partial<BotType> = {
    command: vi.fn((commandName, handler) => {
      if (commandName === 'start') {
        startCommandHandler = handler;
      }
    }) as any,
    use: vi.fn().mockReturnThis(),
  };

  beforeEach(() => {
    createSignupConversation(mockBotInstance as BotType);

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

      const replyMock = conversationContext.reply as Mock;
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

      const replyMock = conversationContext.reply as Mock;
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

      const replyMock = conversationContext.reply as Mock;
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

      const replyMock = conversationContext.reply as Mock;
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
```

---

lib/bot/commands/signup.ts:

```ts
import type { Conversation } from '@grammyjs/conversations';
import type { Context } from 'grammy';

import type { BotType } from '@/lib/bot/types';

import { createConversation } from '@grammyjs/conversations';

import { signupConversationId } from '@/lib/bot/constants';
import { upsertUser } from '@/lib/db/action/user';
import { createChildLogger } from '@/lib/log';

const logger = createChildLogger('bot:command:signup');

export async function signupConversationLogic(conversation: Conversation, ctx: Context) {
  logger.debug('Entered signup conversation');
  await ctx.reply('Hi there! What is your name?');

  const ctxName = await conversation.waitFor('message:text');
  const telegramId = ctxName.from.id;
  const name = ctxName.message.text;
  logger.debug(`Received name: "${name}"`);
  const preEmailCheckpoint = conversation.checkpoint();
  await ctx.reply(`Welcome to Manga Mailer, ${name}!`);
  await ctx.reply(`Where do you want us to mail you updates?`);

  const ctxEmail = await conversation.waitFor('message:text');
  const email = ctxEmail.message.text;
  if (email === '/cancel') {
    return;
  }
  logger.debug(`Received email: "${email}"`);

  const newUser = {
    telegramId,
    name,
    email,
  };

  const result = await conversation.external(async () => upsertUser(newUser));

  if (result.success) {
    logger.debug({ telegramId, name, email }, 'User saved');
    await ctx.reply(`Perfect, we'll use "${email}" as email address!`);
  } else if (result.validationErrors) {
    logger.error({ errors: result.validationErrors }, 'Validation error');
    await ctx.reply(`❗️ Something went wrong:\n\n${result.validationErrors.map(({ field, error }) => `• ${field}: ${error}`).join('\n')}`);
    await conversation.rewind(preEmailCheckpoint);
  } else if (typeof result.databaseError === 'string') {
    logger.error({ errors: [result.databaseError] }, 'Database error');
    await ctx.reply('❗️ Something went wrong, please try again later');
  }
}

export function createSignupConversation(bot: BotType) {
  bot.use(createConversation(signupConversationLogic, {
    id: signupConversationId,
  }));

  bot.command('start', async (ctx) => {
    logger.debug({ userId: ctx.from?.id }, 'Received /start command');
    await ctx.conversation.enter(signupConversationId);
  });
}
```

---

lib/bot/commands/track.test.ts:

```ts
import type { Mock } from 'vitest';

import type { BotType } from '@/lib/bot/types';
import type {
  MockCommandContext,
} from '@/test/mocks/bot/context';

import { InlineKeyboard } from 'grammy';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTrackConversation, trackConversationLogic } from '@/lib/bot/commands/track';
import { trackConversationId } from '@/lib/bot/constants';
import { loggerWriteSpy } from '@/test/log';
import {
  createMockCallbackQueryContext,
  createMockCommandContext,
  createMockConversationControl,
  createMockMessageContext,
} from '@/test/mocks/bot/context';
import {
  mockedTrackManga,
  mockTrackMangaAlreadyTracked,
  mockTrackMangaDbError,
  mockTrackMangaSuccess,
} from '@/test/mocks/db/manga';
import {
  mockedFindUserByTelegramId,
  mockFindUserByTelegramIdNotFound,
  mockFindUserByTelegramIdSuccess,
} from '@/test/mocks/db/user';
import { mockedGetManga, mockedSearchMangas, mockGetMangaSuccess, mockSearchMangaSuccess } from '@/test/mocks/manga';

vi.mock('@/lib/db/action/manga', () => ({
  listTrackedMangas: vi.fn(),
  removeTrackedManga: vi.fn(),
  trackManga: vi.fn(),
}));
vi.mock('@/lib/db/action/user', () => ({
  findUserByTelegramId: vi.fn(),
  upsertUser: vi.fn(),
}));
vi.mock('@/lib/manga', () => ({
  getManga: vi.fn(),
  searchMangas: vi.fn(),
  getChapters: vi.fn(),
  getChapter: vi.fn(),
}));

describe('bot -> commands -> track', () => {
  let trackCommandHandler: ((context: MockCommandContext) => Promise<void>);

  const mockBotInstance: Partial<BotType> = {
    command: vi.fn((commandName, handler) => {
      if (commandName === 'track') {
        trackCommandHandler = handler;
      }
    }) as any,
    use: vi.fn().mockReturnThis(),
  };

  beforeEach(() => {
    createTrackConversation(mockBotInstance as BotType);

    if (!trackCommandHandler) {
      throw new Error('/track command handler not registered');
    }
  });

  it('should register a "track" command handler on the bot', () => {
    expect(mockBotInstance.command).toHaveBeenCalledWith('track', expect.any(Function));
  });

  describe('command Handler: /track', () => {
    it('should enter trackConversation if user exists', async () => {
      const context = createMockCommandContext('/track');
      const user = mockFindUserByTelegramIdSuccess();

      await trackCommandHandler(context);

      expect(mockedFindUserByTelegramId).toHaveBeenCalledWith(context.from?.id);
      expect(context.conversation.enter).toHaveBeenCalledWith(trackConversationId, user);

      expect(loggerWriteSpy).toHaveBeenCalledTimes(1);
      expect(loggerWriteSpy).toHaveBeenLastCalledWith({
        level: 'debug',
        serviceName: 'bot:command:track',
        msg: 'Received /track command',
        userId: context.from?.id,
      });
    });

    it('should not enter trackConversation if user does not exist', async () => {
      const context = createMockCommandContext('/track');
      mockFindUserByTelegramIdNotFound();

      await trackCommandHandler(context);

      expect(mockedFindUserByTelegramId).toHaveBeenCalledWith(context.from?.id);
      expect(context.conversation.enter).not.toHaveBeenCalled();

      const replyMock = context.reply as Mock;
      expect(replyMock).toHaveBeenLastCalledWith('You need to /start and register before you can remove manga.');

      expect(loggerWriteSpy).toHaveBeenCalledTimes(1);
      expect(loggerWriteSpy).toHaveBeenLastCalledWith({
        level: 'debug',
        serviceName: 'bot:command:track',
        msg: 'Received /track command',
        userId: context.from?.id,
      });
    });
  });

  describe('conversation Logic: trackConversationLogic', () => {
    const mockConversationControls = createMockConversationControl();
    const context = createMockMessageContext('');

    it('happy Path: should guide user through tracking a new manga', async () => {
      const user = mockFindUserByTelegramIdSuccess();
      const autocompleteMangas = mockSearchMangaSuccess([{}]);
      const manga = mockGetMangaSuccess();
      const lastReadChapter = '5';
      mockTrackMangaSuccess();

      mockConversationControls.waitFor
        .mockResolvedValueOnce(createMockMessageContext(manga.title!) as any)
        .mockResolvedValueOnce(createMockCallbackQueryContext(
          `${autocompleteMangas[0].connectorName}:${autocompleteMangas[0].id}`,
          context.chat!.id,
          context.from!.id,
          context.message,
        ) as any)
        .mockResolvedValueOnce(createMockMessageContext(lastReadChapter) as any);

      await trackConversationLogic(mockConversationControls, context, user);

      const replyMock = context.reply as Mock;
      expect(replyMock).toHaveBeenNthCalledWith(1, 'Hi there! What is the name of the manga you want to track?');
      expect(replyMock).toHaveBeenNthCalledWith(2, `Cool, I'm searching for "${manga.title}"...`);
      const expectedInlineKeyboard = InlineKeyboard.from([
        [InlineKeyboard.text(
          `[${autocompleteMangas[0].connectorName}] ${autocompleteMangas[0].title} (${autocompleteMangas[0].chaptersCount})`,
          `${autocompleteMangas[0].connectorName}:${autocompleteMangas[0].id}`,
        )],
        [InlineKeyboard.text('❌ Cancel', '/cancel')],
      ]);
      expect(replyMock).toHaveBeenNthCalledWith(3, 'Please select the manga you want to track:', {
        reply_markup: expectedInlineKeyboard,
      });
      expect(replyMock).toHaveBeenNthCalledWith(4, 'Retrieving the selected manga...');
      expect(replyMock).toHaveBeenNthCalledWith(5, 'Which chapter you read last? (if you don\'t know, type "0")');
      expect(replyMock).toHaveBeenNthCalledWith(6, `Perfect, we'll track "${manga.title}" on "${manga.sourceName}"!`);

      expect(mockedSearchMangas).toHaveBeenCalledWith(manga.title);
      expect(mockedGetManga).toHaveBeenCalledWith(autocompleteMangas[0].connectorName, autocompleteMangas[0].id);
      expect(mockedTrackManga).toHaveBeenCalledWith(manga, user.id, Number.parseFloat(lastReadChapter));

      expect(loggerWriteSpy).toHaveBeenCalledTimes(6);
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
        level: 'debug',
        serviceName: 'bot:command:track',
        msg: 'Entered track conversation',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
        level: 'debug',
        serviceName: 'bot:command:track',
        msg: 'Received title: "Epic Adventure Manga"',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
        level: 'debug',
        serviceName: 'bot:command:track',
        msg: 'Found 1 mangas',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(4, {
        level: 'debug',
        serviceName: 'bot:command:track',
        msg: 'Retrieving selected manga: "manga-source-id-123" @ "TestConnectorA"',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(5, {
        level: 'debug',
        serviceName: 'bot:command:track',
        msg: 'Last chapter read: 5',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(6, {
        level: 'debug',
        serviceName: 'bot:command:track',
        msg: 'Manga tracked',
        source: 'TestConnectorA',
        title: 'Epic Adventure Manga',
        userId: 'test-user-id',
      });
    });

    it('should inform if no manga found after search', async () => {
      const mangaTitle = 'Unknown Manga';
      const user = mockFindUserByTelegramIdSuccess();
      mockSearchMangaSuccess();

      mockConversationControls.waitFor
        .mockResolvedValueOnce(createMockMessageContext(mangaTitle) as any);

      await trackConversationLogic(mockConversationControls, context, user);

      const replyMock = context.reply as Mock;
      expect(replyMock).toHaveBeenCalledTimes(3);
      expect(replyMock).toHaveBeenCalledWith('No mangas found');

      expect(mockedSearchMangas).toHaveBeenCalledWith(mangaTitle);
      expect(mockedGetManga).not.toHaveBeenCalled();

      expect(loggerWriteSpy).toHaveBeenCalledTimes(3);
    });

    it('should handle user cancelling manga selection', async () => {
      const mangaTitle = 'Some Manga';
      const user = mockFindUserByTelegramIdSuccess();
      mockSearchMangaSuccess([{}]);

      mockConversationControls.waitFor
        .mockResolvedValueOnce(createMockMessageContext(mangaTitle) as any)
        .mockResolvedValueOnce(createMockCallbackQueryContext(
          `/cancel`,
          context.chat!.id,
          context.from!.id,
          context.message,
        ) as any);

      await trackConversationLogic(mockConversationControls, context, user);

      const replyMock = context.reply as Mock;
      expect(replyMock).toHaveBeenCalledTimes(3);

      expect(mockedSearchMangas).toHaveBeenCalledWith(mangaTitle);
      expect(mockedGetManga).not.toHaveBeenCalled();

      expect(loggerWriteSpy).toHaveBeenCalledTimes(3);
    });

    it('should reply with invalid user if trackManga action returns alreadyTracked', async () => {
      const user = mockFindUserByTelegramIdSuccess();
      const autocompleteMangas = mockSearchMangaSuccess([{}]);
      const manga = mockGetMangaSuccess();
      const lastChapter = '0';
      mockTrackMangaAlreadyTracked();

      mockConversationControls.waitFor
        .mockResolvedValueOnce(createMockMessageContext(manga.title!) as any)
        .mockResolvedValueOnce(createMockCallbackQueryContext(
          `${autocompleteMangas[0].connectorName}:${autocompleteMangas[0].id}`,
          context.chat!.id,
          context.from!.id,
          context.message,
        ) as any)
        .mockResolvedValueOnce(createMockMessageContext(lastChapter) as any);

      await trackConversationLogic(mockConversationControls, context, user);

      const replyMock = context.reply as Mock;
      expect(replyMock).toHaveBeenCalledTimes(6);
      expect(replyMock).toHaveBeenLastCalledWith('❗️ It seems you\'re already tracking this manga!');

      expect(loggerWriteSpy).toHaveBeenCalledTimes(6);
    });

    it('should reply with invalid user if trackManga action returns databaseError', async () => {
      const user = mockFindUserByTelegramIdSuccess();
      const autocompleteMangas = mockSearchMangaSuccess([{}]);
      const manga = mockGetMangaSuccess();
      const lastChapter = '0';
      mockTrackMangaDbError();

      mockConversationControls.waitFor
        .mockResolvedValueOnce(createMockMessageContext(manga.title!) as any)
        .mockResolvedValueOnce(createMockCallbackQueryContext(
          `${autocompleteMangas[0].connectorName}:${autocompleteMangas[0].id}`,
          context.chat!.id,
          context.from!.id,
          context.message,
        ) as any)
        .mockResolvedValueOnce(createMockMessageContext(lastChapter) as any);

      await trackConversationLogic(mockConversationControls, context, user);

      const replyMock = context.reply as Mock;
      expect(replyMock).toHaveBeenCalledTimes(6);
      expect(replyMock).toHaveBeenLastCalledWith('❗️ Something went wrong, please try again later');

      expect(loggerWriteSpy).toHaveBeenCalledTimes(6);
    });
  });
});
```

---

lib/bot/commands/track.ts:

```ts
import type { Conversation } from '@grammyjs/conversations';
import type { Context } from 'grammy';

import type { BotType } from '@/lib/bot/types';
import type { User } from '@/lib/db/model';

import { createConversation } from '@grammyjs/conversations';
import { InlineKeyboard } from 'grammy';

import { trackConversationId } from '@/lib/bot/constants';
import { trackManga } from '@/lib/db/action/manga';
import { findUserByTelegramId } from '@/lib/db/action/user';
import { createChildLogger } from '@/lib/log';
import { getManga, searchMangas } from '@/lib/manga';

const logger = createChildLogger('bot:command:track');

export async function trackConversationLogic(conversation: Conversation, ctx: Context, user: User) {
  logger.debug('Entered track conversation');
  await ctx.reply('Hi there! What is the name of the manga you want to track?');

  const ctxName = await conversation.waitFor('message:text');
  const title = ctxName.message.text;
  logger.debug(`Received title: "${title}"`);
  await ctx.reply(`Cool, I'm searching for "${title}"...`);
  const mangas = await conversation.external(async () => searchMangas(title));

  if (mangas.length === 0) {
    logger.debug('No mangas found');
    await ctx.reply('No mangas found');
    return;
  }

  logger.debug(`Found ${mangas.length} mangas`);

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
  logger.debug(`Retrieving selected manga: "${mangaId}" @ "${connectorName}"`);
  await ctx.reply('Retrieving the selected manga...');

  const manga = await conversation.external(async () => getManga(connectorName, mangaId));
  await ctx.reply('Which chapter you read last? (if you don\'t know, type "0")');

  const ctxChapter = await conversation.waitFor('message:text');
  const lastReadChapter = Number.parseFloat(ctxChapter.message.text);
  logger.debug(`Last chapter read: ${lastReadChapter}`);
  const result = await conversation.external(async () => trackManga(manga, user.id, lastReadChapter));

  if (result.success) {
    logger.debug({ title: manga.title, source: manga.sourceName, userId: user.id }, 'Manga tracked');
    await ctx.reply(`Perfect, we'll track "${manga.title}" on "${manga.sourceName}"!`);
  } else if (result.alreadyTracked) {
    logger.error('Manga already tracked');
    await ctx.reply('❗️ It seems you\'re already tracking this manga!');
  } else {
    logger.error({ errors: [result.databaseError] }, 'Database error');
    await ctx.reply('❗️ Something went wrong, please try again later');
  }
}

export function createTrackConversation(bot: BotType) {
  bot.use(createConversation(trackConversationLogic, {
    id: trackConversationId,
  }));

  bot.command('track', async (ctx) => {
    logger.debug({ userId: ctx.from?.id }, 'Received /track command');
    const user = await findUserByTelegramId(ctx.from!.id);

    if (!user) {
      await ctx.reply('You need to /start and register before you can remove manga.');
      return;
    }

    await ctx.conversation.enter(trackConversationId, user);
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
export const removeConversationId = 'remove';
```

---

lib/bot/index.test.ts:

```ts
import type { MockMessageContext } from '@/test/mocks/bot/context';

import * as conversacionesPlugin from '@grammyjs/conversations';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import * as helpCommand from '@/lib/bot/commands/help';
import * as listCommand from '@/lib/bot/commands/list';
import * as signupCommand from '@/lib/bot/commands/signup';
import * as trackCommand from '@/lib/bot/commands/track';
import { createBot } from '@/lib/bot/index';
import { Bot } from '@/lib/bot/types';
import { createMockMessageContext } from '@/test/mocks/bot/context';

const mockBotInstance = {
  use: vi.fn().mockReturnThis(),
  command: vi.fn().mockReturnThis(),
  on: vi.fn<(msg: string, handler: () => unknown) => void>().mockReturnThis(),
  api: {},
};

vi.mock('@/lib/bot/types', () => ({
  Bot: vi.fn().mockImplementation(() => mockBotInstance),
}));

vi.mock('@grammyjs/conversations', () => ({
  conversations: vi.fn(() => ({ type: 'conversations-plugin' })),
  createConversation: vi.fn(),
}));
vi.mock('@/lib/bot/commands/help', () => ({
  createHelpMessage: vi.fn(),
}));
vi.mock('@/lib/bot/commands/list', () => ({
  createListConversation: vi.fn(),
}));
vi.mock('@/lib/bot/commands/signup', () => ({
  createSignupConversation: vi.fn(),
}));
vi.mock('@/lib/bot/commands/track', () => ({
  createTrackConversation: vi.fn(),
}));

describe('bot Core Logic (lib/bot/index.ts)', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalTelegramToken = process.env.TELEGRAM_TOKEN;

  beforeEach(() => {
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
      expect(messageOnArgs).toHaveLength(2);
      const messageHandler = messageOnArgs![1] as (ctx: MockMessageContext) => Promise<void>;

      const chatId = 6001;
      const ctx = createMockMessageContext('unhandled random text', chatId);

      await messageHandler(ctx);

      expect(ctx.reply).toHaveBeenCalledWith('❗️ I don\'t understand... tap /help to see the list of commands that you can use.');
    });
  });
});
```

---

lib/bot/index.ts:

```ts
import {
  conversations,
} from '@grammyjs/conversations';

import { createHelpMessage } from '@/lib/bot/commands/help';
import { createListConversation } from '@/lib/bot/commands/list';
import { createRemoveConversation } from '@/lib/bot/commands/remove';
import { createSignupConversation } from '@/lib/bot/commands/signup';
import { createTrackConversation } from '@/lib/bot/commands/track';
import { Bot } from '@/lib/bot/types';
import { createChildLogger } from '@/lib/log';

const logger = createChildLogger('bot');

declare global {

  namespace NodeJS {
    interface ProcessEnv {
      TELEGRAM_TOKEN: string;
    }
  }
}

export function createBot(doInit = true) {
  const token = process.env.NODE_ENV === 'test' ? 'test' : process.env.TELEGRAM_TOKEN;
  const bot = new Bot(token);

  if (doInit) {
    bot.use(conversations());

    createSignupConversation(bot);
    createTrackConversation(bot);
    createListConversation(bot);
    createRemoveConversation(bot);
    createHelpMessage(bot);
  }

  bot.on('message', async (ctx) => {
    logger.debug({ message: ctx.message }, 'Unknown message');
    await ctx.reply('❗️ I don\'t understand... tap /help to see the list of commands that you can use.');
  });

  return bot;
}
```

---

lib/bot/types.ts:

```ts
import type { ConversationFlavor } from '@grammyjs/conversations';
import type { Context } from 'grammy';

import { Bot as BotConstructor } from 'grammy';

export type BotContext = ConversationFlavor<Context>;
export const Bot = BotConstructor<BotContext>;
export type BotType = BotConstructor<BotContext>;
```

---

lib/db/action/manga.test.ts:

```ts
import type { MockInstance } from 'vitest';

import type { Manga, User } from '@/lib/db/model';

import { and, eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/lib/db';
import { listTrackedMangas, removeTrackedManga, trackManga } from '@/lib/db/action/manga';
import { mangaTable, userMangaTable, userTable } from '@/lib/db/model';
import { defaultUser } from '@/test/mocks/db/user';
import { defaultManga } from '@/test/mocks/manga';

describe('db -> action -> manga', () => {
  let createdUser: User;
  let insertSpy: MockInstance<typeof db.insert>;
  let deleteSpy: MockInstance<typeof db.delete>;

  beforeEach(async () => {
    [createdUser] = await db.insert(userTable).values(defaultUser).returning();
    insertSpy = vi.spyOn(db, 'insert');
    deleteSpy = vi.spyOn(db, 'delete');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('trackManga', () => {
    it('should track a new manga for a user successfully (manga not in DB)', async () => {
      const lastReadChapter = 0;
      const result = await trackManga(defaultManga, createdUser.id, lastReadChapter);
      expect(result).toHaveProperty('success', true);

      const manga = await db.query.mangaTable.findFirst({
        where: (manga, { eq }) => eq(manga.sourceId, defaultManga.sourceId),
      });
      expect(manga).toBeDefined();
      if (typeof manga === 'undefined') {
        throw new TypeError('Invalid test');
      }
      expect(manga).toHaveProperty('title', defaultManga.title);

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
      const [manga] = await db.insert(mangaTable).values(defaultManga).returning();

      const lastReadChapter = 1;
      const result = await trackManga(manga, createdUser.id, lastReadChapter);
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
      const nonExistentUserId = 'user-id';
      const result = await trackManga(defaultManga, nonExistentUserId, 0);
      expect(result).toHaveProperty('success', false);
      if (result.success) {
        throw new Error('Test failed');
      }
      expect(result).toHaveProperty('alreadyTracked', false);
      expect(result).toHaveProperty('databaseError', 'insert or update on table "user-manga" violates foreign key constraint "user-manga_userId_user_id_fk"');
    });

    it('should return alreadyTracked if the manga is already tracked by the user', async () => {
      const lastReadChapter = 0;
      await trackManga(defaultManga, createdUser.id, lastReadChapter);

      const result = await trackManga(defaultManga, createdUser.id, lastReadChapter);
      expect(result).toHaveProperty('success', false);
      if (result.success) {
        throw new Error('Test failed');
      }
      expect(result).toHaveProperty('alreadyTracked', true);
      expect(result).not.toHaveProperty('databaseError');
    });

    it('should return databaseError if inserting manga fails', async () => {
      const simulatedError = 'DB Error on Manga Insert';
      insertSpy.mockImplementationOnce(() => ({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockRejectedValue(new Error(simulatedError) as never),
      } as any));

      const result = await trackManga(defaultManga, createdUser.id, 0);
      expect(result).toHaveProperty('success', false);
      if (result.success) {
        throw new Error('Test failed');
      }
      expect(result).toHaveProperty('alreadyTracked', false);
      expect(result).toHaveProperty('databaseError', simulatedError);

      expect(insertSpy).toHaveBeenCalledTimes(1);
    });

    it('should return databaseError if inserting userManga (tracker) fails', async () => {
      const simulatedError = 'DB Error on Tracker Insert';
      insertSpy.mockImplementationOnce(() => ({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([defaultManga] as never),
      } as any))
        .mockImplementationOnce(() => ({
          values: vi.fn().mockRejectedValue(new Error(simulatedError) as never),
        } as any))
        .mockImplementationOnce(() => ({
          values: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValueOnce([{ ...defaultManga, id: 'mocked-manga-id' }] as never),
        } as any))
        .mockImplementationOnce(() => ({
          values: vi.fn().mockRejectedValueOnce(new Error(simulatedError) as never),
        } as any));

      const result = await trackManga(defaultManga, createdUser.id, 0);
      expect(result).toHaveProperty('success', false);
      if (result.success) {
        throw new Error('Test failed');
      }
      expect(result).toHaveProperty('alreadyTracked', false);
      expect(result).toHaveProperty('databaseError', simulatedError);

      expect(insertSpy).toHaveBeenCalledTimes(2);
      expect(insertSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('removeTrackedManga', () => {
    let manga1: Manga;
    let manga2: Manga;

    beforeEach(async () => {
      [manga1] = await db.insert(mangaTable).values({
        ...defaultManga,
        id: 'manga-id-123-1',
        sourceId: 'manga-to-remove-1',
        title: 'Manga To Remove 1',
      }).returning();
      [manga2] = await db.insert(mangaTable).values({
        ...defaultManga,
        id: 'manga-id-123-2',
        sourceId: 'manga-to-keep-1',
        title: 'Manga To Keep 1',
      }).returning();

      await db.insert(userMangaTable).values([
        { userId: createdUser.id, mangaId: manga1.id, lastReadChapter: 1 },
        { userId: createdUser.id, mangaId: manga2.id, lastReadChapter: 1 },
      ]);
    });

    it('should successfully remove a tracked manga for a user', async () => {
      // Verifica che il tracker esista prima
      let tracker = await db.query.userMangaTable.findFirst({
        where: and(eq(userMangaTable.userId, createdUser.id), eq(userMangaTable.mangaId, manga1.id)),
      });
      expect(tracker).toBeDefined();

      const result = await removeTrackedManga(createdUser.id, manga1.id);
      expect(result.success).toBe(true);

      // Verifica che il tracker sia stato rimosso
      tracker = await db.query.userMangaTable.findFirst({
        where: and(eq(userMangaTable.userId, createdUser.id), eq(userMangaTable.mangaId, manga1.id)),
      });
      expect(tracker).toBeUndefined();

      // Verifica che l'altro tracker esista ancora
      const otherTracker = await db.query.userMangaTable.findFirst({
        where: and(eq(userMangaTable.userId, createdUser.id), eq(userMangaTable.mangaId, manga2.id)),
      });
      expect(otherTracker).toBeDefined();
    });

    it('should return notFound if the user is not tracking the specified manga', async () => {
      const nonTrackedMangaId = 'non-tracked-manga-id'; // Un ID di un manga che l'utente non traccia
      const result = await removeTrackedManga(createdUser.id, nonTrackedMangaId);
      expect(result.success).toBe(false);
      if (result.success)
        throw new Error('Test should have failed');
      expect(result.notFound).toBe(true);
    });

    it('should return notFound if the user ID does not exist', async () => {
      const nonExistentUserId = 'non-existent-user-id';
      const result = await removeTrackedManga(nonExistentUserId, manga1.id);
      expect(result.success).toBe(false);
      if (result.success) {
        throw new Error('Test should have failed');
      }
      expect(result.notFound).toBe(true); // Perché il findFirst non troverà la combinazione
    });

    it('should return databaseError if db.delete fails', async () => {
      const simulatedError = 'DB Error on Delete';
      deleteSpy.mockImplementationOnce(
        () => ({
          where: vi.fn().mockRejectedValue(new Error(simulatedError)),
        } as any),
      );

      const result = await removeTrackedManga(createdUser.id, manga1.id);

      expect(result.success).toBe(false);
      if (result.success) {
        throw new Error('Test should have failed');
      }
      expect(result.databaseError).toBe(simulatedError);

      expect(deleteSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('listTrackedMangas', () => {
    it('should return an empty array if user tracks no mangas', async () => {
      const mangas = await listTrackedMangas(createdUser.id);
      expect(mangas).toEqual([]);
    });

    it('should return a list of tracked mangas for the user, ordered by title', async () => {
      const manga1Data = { ...defaultManga, id: 'manga-id-123-1', sourceId: 'manga001', title: 'Alpha Test Manga' };
      const manga2Data = { ...defaultManga, id: 'manga-id-123-2', sourceId: 'manga002', title: 'Zulu Test Manga' };
      const manga3Data = { ...defaultManga, id: 'manga-id-123-3', sourceId: 'manga003', title: 'Beta Test Manga' };

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
import { mangaTable, userMangaTable } from '@/lib/db/model';
import { createChildLogger } from '@/lib/log';

const logger = createChildLogger('db:action:manga');

export type TrackMangaOutput = {
  success: true;
} | {
  success: false;
  alreadyTracked: boolean;
  databaseError?: string;
};

export async function trackManga(
  manga: MangaInsert,
  userId: string,
  lastReadChapter: number,
): Promise<TrackMangaOutput> {
  logger.debug('[trackManga] Attempting to remove manga tracking.', { manga, userId, lastReadChapter });

  try {
    let existingManga = await db.query.mangaTable.findFirst({
      where: and(
        eq(mangaTable.sourceName, manga.sourceName),
        eq(mangaTable.sourceId, manga.sourceId),
      ),
    });

    if (!existingManga) {
      logger.debug('[trackManga] Manga does not exist, inserting.', { manga, userId, lastReadChapter });
      [existingManga] = await db.insert(mangaTable).values(manga).returning();
    }

    const existingTracker = await db.query.userMangaTable.findFirst({
      where: and(
        eq(userMangaTable.userId, userId),
        eq(userMangaTable.mangaId, existingManga.id),
      ),
    });

    if (existingTracker) {
      return {
        success: false,
        alreadyTracked: true,
      };
    }

    await db.insert(userMangaTable).values({
      userId,
      mangaId: existingManga.id,
      lastReadChapter,
    });

    return { success: true };
  } catch (error) {
    logger.error('[trackManga] Database error:', error, { manga, userId, lastReadChapter });

    return {
      success: false,
      alreadyTracked: false,
      databaseError: (error as Error).message,
    };
  }
}

export type RemoveTrackedMangaOutput = {
  success: true;
} | {
  success: false;
  notFound: boolean;
  databaseError?: string;
};

export async function removeTrackedManga(userId: string, mangaId: string): Promise<RemoveTrackedMangaOutput> {
  logger.debug('[removeTrackedManga] Attempting to remove manga tracking.', { userId, mangaId });
  try {
    const existingTracker = await db.query.userMangaTable.findFirst({
      where: and(
        eq(userMangaTable.userId, userId),
        eq(userMangaTable.mangaId, mangaId),
      ),
    });

    if (!existingTracker) {
      logger.warn('[removeTrackedManga] Tracker not found. No action taken.', { userId, mangaId });
      return { success: false, notFound: true };
    }

    await db.delete(userMangaTable).where(
      and(
        eq(userMangaTable.userId, userId),
        eq(userMangaTable.mangaId, mangaId),
      ),
    );
    logger.info('[removeTrackedManga] Manga tracking removed successfully.', { userId, mangaId });
    return { success: true };
  } catch (error) {
    logger.error('[removeTrackedManga] Database error while removing manga tracking.', { error, userId, mangaId });
    return {
      success: false,
      notFound: false,
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
import { afterEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/lib/db';
import { findUserByTelegramId, upsertUser } from '@/lib/db/action/user';
import { userTable } from '@/lib/db/model';

describe('db -> action -> user', () => {
  const name = 'Test User vi';
  const email = 'testvi@example.com';
  const telegramId = 123;

  afterEach(() => {
    vi.restoreAllMocks();
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
      expect(result).toHaveProperty('validationErrors');
      expect(result).toHaveProperty('validationErrors.0.field', 'email');
      expect(result).toHaveProperty('validationErrors.0.error', 'Invalid email address');
    });

    it('should return databaseError if db.insert fails', async () => {
      const newUser = { name, email, telegramId };

      const simulatedError = 'Simulated DB Insert Error';
      const insertSpy = vi.spyOn(db, 'insert').mockImplementationOnce(() => ({
        values: vi.fn().mockRejectedValue(new Error(simulatedError)),
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
      const updateSpy = vi.spyOn(db, 'update').mockImplementationOnce(() => ({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockRejectedValue(new Error(simulatedError)),
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
import { createChildLogger } from '@/lib/log';
import { userValidation } from '@/lib/validation/user';

const logger = createChildLogger('db:action:user');

export interface UpsertInput {
  telegramId: number;
  name: string;
  email: string;
}

export type UpsertOutput = {
  success: true;
} | {
  success: false;
  validationErrors?: { field: string; error: string }[];
  databaseError?: string;
};

export async function upsertUser(newUser: UpsertInput): Promise<UpsertOutput> {
  const parsingResult = userValidation.safeParse(newUser);
  if (!parsingResult.success) {
    logger.error('[upsertUser] Validation error:', parsingResult.error);

    return {
      success: false,
      validationErrors: Object.entries(parsingResult.error.flatten().fieldErrors).map(([field, errors]) => ({ field, error: errors.join(', ') })),
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
    logger.error('[upsertUser] Database error:', error);

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
import { index, integer, jsonb, pgEnum, pgTable, real, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

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
  genres: jsonb().$type<string[]>(),
  score: real(),
  lastCheckedAt: timestamp({ mode: 'date' }),
  chaptersCount: integer(),
  ...timestamps,
}, mangaTable => [
  {
    sourceUniqueIndex: uniqueIndex('manga_unique_source_idx').on(mangaTable.sourceName, mangaTable.sourceId),
    lastCheckedAtIndex: index('manga_last_checked_at_idx').on(mangaTable.lastCheckedAt),
  },
]);
export type MangaInsert = typeof mangaTable.$inferInsert;
export type Manga = typeof mangaTable.$inferSelect;

export const chapterTable = pgTable('chapter', {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sourceName: text().notNull(),
  sourceId: text().notNull(),
  mangaId: text()
    .references(() => mangaTable.id, { onDelete: 'cascade' })
    .notNull(),
  title: text(),
  index: real(),
  url: text(),
  releasedAt: timestamp({ mode: 'date' }),
  images: jsonb().$type<string[]>(),
  ...timestamps,
}, chapterTable => [
  {
    sourceUniqueIndex: uniqueIndex('chapter_unique_source_idx').on(chapterTable.sourceName, chapterTable.sourceId),
    mangaIdIndex: index('chapter_manga_id_idx').on(chapterTable.mangaId),
  },
]);
export type ChapterInsert = typeof chapterTable.$inferInsert;
export type Chapter = typeof chapterTable.$inferSelect;

export const mangaRelations = relations(mangaTable, ({ many }) => ({
  userMangas: many(userMangaTable),
  chapters: many(chapterTable),
}));

export const chapterRelations = relations(chapterTable, ({ one }) => ({
  manga: one(mangaTable, {
    fields: [chapterTable.mangaId],
    references: [mangaTable.id],
  }),
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
  user: one(userTable, {
    fields: [userMangaTable.userId],
    references: [userTable.id],
  }),
  manga: one(mangaTable, {
    fields: [userMangaTable.mangaId],
    references: [mangaTable.id],
  }),
}));
```

---

lib/email.test.ts:

```ts
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { loggerWriteSpy } from '@/test/log';

import { sendEmail } from './email';

const mocks = vi.hoisted(() => {
  return {
    sendMail: vi.fn(),
    verify: vi.fn(),
  };
});

vi.mock(import('nodemailer'), () => {
  return {
    createTransport: () => ({
      sendMail: mocks.sendMail,
      verify: mocks.verify,
    }),
  } as any;
});

describe('lib -> email', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalActuallySendMailFlag = process.env.ACTUALLY_SEND_MAIL_IN_TEST;

  const emailOptions = {
    to: 'recipient@example.com',
    subject: 'Test Subject',
    html: '<p>Test HTML</p>',
    text: 'Test Text',
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // @ts-expect-error node env is not readonly
    process.env.NODE_ENV = 'development';
    process.env.MAIL_HOST = 'test.mailtrap.io';
    process.env.MAIL_PORT = '2525';
    process.env.MAIL_USER = 'testuser';
    process.env.MAIL_PASS = 'testpass';
    process.env.EMAIL_SENDER = '"Manga Mailer" <noreply@example.com>';
    delete process.env.ACTUALLY_SEND_MAIL_IN_TEST;
  });

  afterAll(() => {
    // @ts-expect-error node env is not readonly
    process.env.NODE_ENV = originalNodeEnv;
    process.env.ACTUALLY_SEND_MAIL_IN_TEST = originalActuallySendMailFlag;
  });

  it('should call transporter.sendMail with correct parameters on successful send', async () => {
    mocks.sendMail.mockResolvedValueOnce({
      messageId: 'test-message-id',
      accepted: [emailOptions.to],
      response: '250 OK',
    });

    const success = await sendEmail(emailOptions);

    expect(success).toBe(true);

    expect(mocks.sendMail).toHaveBeenCalledTimes(1);
    expect(mocks.sendMail).toHaveBeenCalledWith({
      from: process.env.EMAIL_SENDER,
      to: emailOptions.to,
      subject: emailOptions.subject,
      html: emailOptions.html,
      text: emailOptions.text,
    });

    expect(loggerWriteSpy).toHaveBeenCalledTimes(2);
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
      level: 'info',
      serviceName: 'email',
      msg: 'Attempting to send email...',
      to: emailOptions.to,
      subject: emailOptions.subject,
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
      level: 'info',
      serviceName: 'email',
      msg: 'Email sent successfully',
      messageId: 'test-message-id',
      accepted: [emailOptions.to],
      response: '250 OK',
    });
  });

  it('should return false and log error if sendMail fails', async () => {
    const error = new Error('SMTP Connection Error');
    mocks.sendMail.mockRejectedValueOnce(error);

    const success = await sendEmail(emailOptions);

    expect(success).toBe(false);
    expect(mocks.sendMail).toHaveBeenCalledTimes(1);

    expect(loggerWriteSpy).toHaveBeenCalledTimes(3);
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
      level: 'info',
      serviceName: 'email',
      msg: 'Attempting to send email...',
      to: emailOptions.to,
      subject: emailOptions.subject,
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
      level: 'error',
      serviceName: 'email',
      msg: 'Error sending email',
      subject: 'Test Subject',
      to: 'recipient@example.com',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
      level: 'info',
      serviceName: 'email',
      msg: 'SMTP Connection Error',
      err: {
        type: 'Error',
        message: 'SMTP Connection Error',
        stack: expect.stringMatching('.*'),
      },
    });
  });

  describe('test Environment Behavior', () => {
    beforeEach(() => {
      // @ts-expect-error node env is not readonly
      process.env.NODE_ENV = 'test';
    });

    it('should skip sending email and return true in test environment by default', async () => {
      delete process.env.ACTUALLY_SEND_MAIL_IN_TEST;
      const success = await sendEmail(emailOptions);

      expect(success).toBe(true);
      expect(mocks.sendMail).not.toHaveBeenCalled();

      expect(loggerWriteSpy).toHaveBeenCalledTimes(1);
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
        level: 'info',
        serviceName: 'email',
        msg: 'Email sending skipped in test environment (unless ACTUALLY_SEND_MAIL_IN_TEST is true).',
        options: {
          html: '<p>Test HTML</p>',
          subject: 'Test Subject',
          text: 'Test Text',
          to: 'recipient@example.com',
        },
      });
    });

    it('should attempt to send email in test environment if ACTUALLY_SEND_MAIL_IN_TEST is "true"', async () => {
      process.env.ACTUALLY_SEND_MAIL_IN_TEST = 'true';
      mocks.sendMail.mockResolvedValueOnce({ messageId: 'test-e2e-send', accepted: [emailOptions.to] });

      const success = await sendEmail(emailOptions);

      expect(success).toBe(true);
      expect(mocks.sendMail).toHaveBeenCalledTimes(1);

      expect(loggerWriteSpy).toHaveBeenCalledTimes(2);
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
        level: 'info',
        serviceName: 'email',
        msg: 'Attempting to send email...',
        to: emailOptions.to,
        subject: emailOptions.subject,
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
        level: 'info',
        serviceName: 'email',
        msg: 'Email sent successfully',
        messageId: 'test-e2e-send',
        accepted: [emailOptions.to],
      });
    });
  });
});
```

---

lib/email.ts:

```ts
import { createTransport } from 'nodemailer';

import { createChildLogger } from '@/lib/log';

declare global {

  namespace NodeJS {
    interface ProcessEnv {
      MAIL_HOST: string;
      MAIL_PORT: string;
      MAIL_USER: string;
      MAIL_PASS: string;
      EMAIL_SENDER: string;
    }
  }
}

interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html: string;
}

const logger = createChildLogger('email');

const transporter = createTransport({
  host: process.env.MAIL_HOST,
  port: Number.parseInt(process.env.MAIL_PORT ?? '2525', 10),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

if (process.env.NODE_ENV !== 'test') {
  transporter.verify((error) => {
    if (error) {
      logger.error({ error }, 'Error configuring mail transporter');
    } else {
      logger.info('Mail transporter configured successfully. Ready to send emails (to Mailtrap).');
    }
  });
}

export async function sendEmail(options: MailOptions): Promise<boolean> {
  if (process.env.NODE_ENV === 'test' && process.env.ACTUALLY_SEND_MAIL_IN_TEST !== 'true') {
    logger.info({ options }, 'Email sending skipped in test environment (unless ACTUALLY_SEND_MAIL_IN_TEST is true).');
    return true;
  }

  try {
    logger.info({ to: options.to, subject: options.subject }, 'Attempting to send email...');

    const info = await transporter.sendMail({
      from: process.env.EMAIL_SENDER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    logger.info({ messageId: info.messageId, accepted: info.accepted, response: info.response }, 'Email sent successfully');

    return info.accepted.length > 0;
  } catch (error) {
    logger.error({ to: options.to, subject: options.subject }, 'Error sending email');
    logger.info(error);

    return false;
  }
}
```

---

lib/log.ts:

```ts
import type { Logger, LoggerOptions } from 'pino';

import pino from 'pino';

let level = process.env.LOG_LEVEL;
if (typeof level === 'undefined') {
  switch (process.env.NODE_ENV) {
    case 'production':
      level = 'info';
      break;

    case 'test':
      level = 'silent';
      break;

    case 'development':
    default:
      level = 'debug';
      break;
  }
}

const config: LoggerOptions = { level };

if (process.env.NODE_ENV !== 'production' && process.env.LOG_FORMAT !== 'json') {
  config.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  };
}

const logger = pino(config);

export function createChildLogger(serviceName: string, parent: Logger = logger): Logger {
  return parent.child({ serviceName });
}
```

---

lib/manga.test.ts:

```ts
import type { Mock } from 'vitest';

import type { mangaTable } from '@/lib/db/model/manga';

import * as mangaScraper from '@zweer/manga-scraper';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getManga, searchMangas } from '@/lib/manga';

vi.mock('@zweer/manga-scraper', () => ({
  __esModule: true,
  connectors: {
    TestConnectorA: {
      getMangas: vi.fn(),
      getManga: vi.fn(),
      getChapters: vi.fn(),
      getChapter: vi.fn(),
    },
    TestConnectorB: {
      getMangas: vi.fn(),
      getManga: vi.fn(),
      getChapters: vi.fn(),
      getChapter: vi.fn(),
    },
  },
}));

const mockedConnectors = mangaScraper.connectors as unknown as {
  TestConnectorA: { getMangas: Mock; getManga: Mock; getChapters: Mock; getChapter: Mock };
  TestConnectorB: { getMangas: Mock; getManga: Mock; getChapters: Mock; getChapter: Mock };
};

describe('manga Library Functions (lib/manga.ts)', () => {
  beforeEach(() => {
    Object.values(mockedConnectors).forEach((connector) => {
      connector.getMangas.mockReset();
      connector.getManga.mockReset();
      connector.getChapters.mockReset();
      connector.getChapter.mockReset();
    });
  });

  describe('searchMangas', () => {
    it('should call getMangas on all configured connectors and aggregate results', async () => {
      const searchTerm = 'Test Search';
      const mangasA = [{ id: 'a1', title: 'Manga A1 from TestConnectorA', chaptersCount: 10 }];
      const mangasB = [{ id: 'b1', title: 'Manga B1 from TestConnectorB', chaptersCount: 5 }];

      mockedConnectors.TestConnectorA.getMangas.mockResolvedValue(mangasA);
      mockedConnectors.TestConnectorB.getMangas.mockResolvedValue(mangasB);

      const results = await searchMangas(searchTerm);

      expect(mockedConnectors.TestConnectorA.getMangas).toHaveBeenCalledWith(searchTerm);
      expect(mockedConnectors.TestConnectorB.getMangas).toHaveBeenCalledWith(searchTerm);

      expect(results).toEqual(expect.arrayContaining([
        { connectorName: 'TestConnectorA', id: 'a1', title: 'Manga A1 from TestConnectorA', chaptersCount: 10 },
        { connectorName: 'TestConnectorB', id: 'b1', title: 'Manga B1 from TestConnectorB', chaptersCount: 5 },
      ]));
      expect(results.length).toBe(2);
    });

    it('should correctly sort mangas by title, then by chaptersCount', async () => {
      const mangasA = [
        { id: 'a2', title: 'Beta Manga', chaptersCount: 20 },
        { id: 'a1', title: 'Alpha Manga', chaptersCount: 10 },
      ];
      const mangasB = [
        { id: 'b1', title: 'Alpha Manga', chaptersCount: 5 },
      ];

      mockedConnectors.TestConnectorA.getMangas.mockResolvedValue(mangasA);
      mockedConnectors.TestConnectorB.getMangas.mockResolvedValue(mangasB);

      const results = await searchMangas('any');

      expect(results.length).toBe(3);
      expect(results[0]).toEqual({ connectorName: 'TestConnectorB', id: 'b1', title: 'Alpha Manga', chaptersCount: 5 });
      expect(results[1]).toEqual({ connectorName: 'TestConnectorA', id: 'a1', title: 'Alpha Manga', chaptersCount: 10 });
      expect(results[2]).toEqual({ connectorName: 'TestConnectorA', id: 'a2', title: 'Beta Manga', chaptersCount: 20 });
    });

    it('should return an empty array if no mangas are found', async () => {
      mockedConnectors.TestConnectorA.getMangas.mockResolvedValue([]);
      mockedConnectors.TestConnectorB.getMangas.mockResolvedValue([]);

      const results = await searchMangas('nonexistent');
      expect(results).toEqual([]);
    });

    it('should handle errors from one connector gracefully and still return results from others', async () => {
      const mangasB = [{ id: 'b1', title: 'Manga B1', chaptersCount: 5 }];
      mockedConnectors.TestConnectorA.getMangas.mockRejectedValue(new Error('Connector A failed'));
      mockedConnectors.TestConnectorB.getMangas.mockResolvedValue(mangasB);

      const results = await searchMangas('any');
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('b1');
    });
  });

  describe('getManga', () => {
    it('should call getManga on the specified connector and return mapped data', async () => {
      const connectorName = 'TestConnectorA';
      const mangaId = 'test-id-a1';
      const rawMangaDataFromScraper = {
        id: mangaId,
        slug: 'test-slug',
        title: 'Detailed Manga Title',
        author: 'Scraper Author',
        artist: 'Scraper Artist',
        excerpt: 'Full excerpt from scraper.',
        image: 'http://scraper.dev/image.png',
        url: 'http://scraper.dev/manga/test-id-a1',
        releasedAt: new Date('2023-01-01T00:00:00.000Z'),
        status: 'Ongoing',
        genres: ['action', 'adventure'],
        score: 9.0,
        chaptersCount: 150,
      };

      mockedConnectors.TestConnectorA.getManga.mockResolvedValue(rawMangaDataFromScraper);

      const result = await getManga(connectorName, mangaId);

      expect(mockedConnectors.TestConnectorA.getManga).toHaveBeenCalledWith(mangaId);
      const expectedResult: typeof mangaTable.$inferInsert = {
        sourceName: connectorName,
        sourceId: mangaId,
        slug: 'test-slug',
        title: 'Detailed Manga Title',
        author: 'Scraper Author',
        artist: 'Scraper Artist',
        excerpt: 'Full excerpt from scraper.',
        image: 'http://scraper.dev/image.png',
        url: 'http://scraper.dev/manga/test-id-a1',
        releasedAt: new Date('2023-01-01T00:00:00.000Z'),
        status: 'Ongoing',
        genres: ['action', 'adventure'],
        score: 9.0,
        chaptersCount: 150,
      };
      expect(result).toEqual(expectedResult);
    });

    it('should throw an error if an invalid connector name is provided', async () => {
      const invalidConnectorName = 'NonExistentConnector';
      const mangaId = 'any-id';

      await expect(getManga(invalidConnectorName, mangaId)).rejects.toThrow('Invalid connector name');
    });

    it('should throw an error if the connector fails to get manga details', async () => {
      const connectorName = 'TestConnectorB';
      const mangaId = 'fail-id-b1';
      mockedConnectors.TestConnectorB.getManga.mockRejectedValue(new Error('Scraping failed'));

      await expect(getManga(connectorName, mangaId)).rejects.toThrow('Scraping failed');
    });
  });
});
```

---

lib/manga.ts:

```ts
import type { ConnectorNames } from '@zweer/manga-scraper';

import type { ChapterInsert, MangaInsert } from '@/lib/db/model/manga';

import { connectors } from '@zweer/manga-scraper';

import { createChildLogger } from '@/lib/log';

const logger = createChildLogger('lib:manga');

export interface MangaAutocomplete {
  connectorName: string;
  id: string;
  title: string;
  chaptersCount: number;
}

export async function searchMangas(title: string): Promise<MangaAutocomplete[]> {
  const mangasArr: MangaAutocomplete[][] = await Promise.all(
    Object.entries(connectors).map(async ([connectorName, connector]) => {
      try {
        logger.debug(`[search] Searching "${title}" with connector: ${connectorName}`);
        const newMangas = await connector.getMangas(title);

        return newMangas.map(manga => ({
          connectorName,
          id: manga.id,
          title: manga.title,
          chaptersCount: manga.chaptersCount,
        }));
      } catch (error) {
        logger.error(`[search] Error with connector ${connectorName} while searching for "${title}":`, error);
        return [];
      }
    }),
  );

  const mangas = mangasArr
    .flat()
    .sort((mangaA, mangaB) => {
      if (mangaA.title.localeCompare(mangaB.title) === 0) {
        return mangaA.chaptersCount - mangaB.chaptersCount;
      }
      return mangaA.title.localeCompare(mangaB.title);
    });

  return mangas;
}

export async function getManga(connectorName: string, id: string): Promise<MangaInsert> {
  const connector = connectors[connectorName as ConnectorNames];

  if (!connector) {
    throw new Error('Invalid connector name');
  }

  try {
    logger.debug(`[get] Getting manga "${id}" with connector: ${connectorName}`);
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
  } catch (error) {
    logger.error(`[get] Error with connector ${connectorName} while getting manga "${id}":`, error);
    throw error;
  }
}

export async function getChapters(connectorName: string, mangaId: string): Promise<ChapterInsert[]> {
  const connector = connectors[connectorName as ConnectorNames];

  if (!connector) {
    throw new Error('Invalid connector name');
  }

  try {
    logger.debug(`[getChapters] Getting manga "${mangaId}" chapters with connector: ${connectorName}`);
    const chapters = await connector.getChapters(mangaId);

    return chapters.map(chapter => ({
      mangaId,
      sourceName: connectorName,
      sourceId: chapter.id,
      title: chapter.title,
      index: chapter.index,
      url: chapter.url,
      releasedAt: chapter.releasedAt && new Date(chapter.releasedAt),
      images: chapter.images,
    }));
  } catch (error) {
    logger.error(`[getChapters] Error with connector ${connectorName} while getting manga "${mangaId}" chapters:`, error);
    throw error;
  }
}

export async function getChapter(connectorName: string, mangaId: string, chapterId: string): Promise<ChapterInsert> {
  const connector = connectors[connectorName as ConnectorNames];

  if (!connector) {
    throw new Error('Invalid connector name');
  }

  try {
    logger.debug(`[getChapter] Getting manga "${mangaId}" chapter "${chapterId}" with connector: ${connectorName}`);
    const chapter = await connector.getChapter(mangaId, chapterId);

    return {
      mangaId,
      sourceName: connectorName,
      sourceId: chapter.id,
      title: chapter.title,
      index: chapter.index,
      url: chapter.url,
      releasedAt: chapter.releasedAt && new Date(chapter.releasedAt),
      images: chapter.images,
    };
  } catch (error) {
    logger.error(`[getChapter] Error with connector ${connectorName} while getting manga "${mangaId}" chapter "${chapterId}":`, error);
    throw error;
  }
}
```

---

lib/service/mangaUpdater.test.ts:

```ts
import type { MockInstance } from 'vitest';

import type { Chapter, Manga, User } from '@/lib/db/model';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/lib/db';
import { chapterTable, mangaTable, userMangaTable, userTable } from '@/lib/db/model';
import { mangaUpdater } from '@/lib/service/mangaUpdater';
import { loggerWriteSpy } from '@/test/log';
import { defaultUser } from '@/test/mocks/db/user';
import { mockedSendEmail, mockSendEmailError, mockSendEmailSuccess } from '@/test/mocks/email';
import {
  defaultChapter,
  defaultManga,
  mockedGetChapters,
  mockedGetManga,
  mockGetChaptersError,
  mockGetChaptersSuccess,
  mockGetMangaConnectorError,
  mockGetMangaSuccess,
} from '@/test/mocks/manga';

vi.mock('@/lib/manga', () => ({
  getManga: vi.fn(),
  searchMangas: vi.fn(),
  getChapters: vi.fn(),
  getChapter: vi.fn(),
}));
vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn(),
}));

const manga1: Manga = {
  ...defaultManga,
  id: 'manga-id-1',
  sourceName: 'TestConnectorA',
  sourceId: 'manga-source-id-1',
  title: 'Epic Adventure Manga 1',
  chaptersCount: 11,
};
const manga1Chapters: Chapter[] = Array.from({ length: manga1.chaptersCount! }, (_, index) => ({
  ...defaultChapter,
  id: `chapter-id-a-${index}`,
  mangaId: manga1.id,
  sourceId: `chapter-source-id-a-${index}`,
  title: `${defaultChapter.title} ${index}`,
  index,
}));
const manga2: Manga = {
  ...defaultManga,
  id: 'manga-id-2',
  sourceName: 'TestConnectorA',
  sourceId: 'manga-source-id-2',
  title: 'Epic Adventure Manga 2',
  chaptersCount: 12,
};
const manga2Chapters: Chapter[] = Array.from({ length: manga2.chaptersCount! }, (_, index) => ({
  ...defaultChapter,
  id: `chapter-id-b-${index}`,
  mangaId: manga2.id,
  sourceId: `chapter-source-id-b-${index}`,
  title: `${defaultChapter.title} ${index}`,
  index,
}));

const user1: User = {
  ...defaultUser,
  id: 'test-user-id-1',
  name: 'Test User 1',
  email: 'test1@example.com',
  telegramId: 1,
};

describe('task: checkForMangaUpdates', () => {
  let insertSpy: MockInstance<typeof db.insert>;
  let updateSpy: MockInstance<typeof db.update>;

  beforeEach(async () => {
    insertSpy = vi.spyOn(db, 'insert');
    updateSpy = vi.spyOn(db, 'update');

    await db.insert(userTable).values([user1]);
    await db.insert(mangaTable).values([manga1, manga2]);
    await db.insert(chapterTable).values([...manga1Chapters, ...manga2Chapters]);
  });

  it('should check a manga even if none is tracking, find no update, and not update DB or list users', async () => {
    mockGetMangaSuccess(manga1);
    mockGetMangaSuccess(manga2);

    const result = await mangaUpdater();

    expect(mockedGetManga).toHaveBeenCalledTimes(2);
    expect(mockedGetChapters).toHaveBeenCalledTimes(0);
    expect(mockedSendEmail).toHaveBeenCalledTimes(0);

    expect(result).toEqual({
      emailsSent: 0,
      updatedMangas: [],
      errors: [],
    });

    expect(updateSpy).not.toHaveBeenCalled();

    expect(loggerWriteSpy).toHaveBeenCalledTimes(10);
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
      level: 'info',
      msg: 'Starting manga update check...',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
      level: 'info',
      msg: 'Found 2 mangas. Checking for updates...',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
      level: 'debug',
      mangaId: 'manga-id-1',
      mangaTitle: 'Epic Adventure Manga 1',
      msg: 'Checking manga for updates.',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(4, {
      level: 'debug',
      mangaId: 'manga-id-1',
      mangaTitle: 'Epic Adventure Manga 1',
      oldChapters: 11,
      newChapters: 11,
      msg: 'No new chapters found.',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(5, {
      level: 'debug',
      mangaId: 'manga-id-2',
      mangaTitle: 'Epic Adventure Manga 2',
      msg: 'Checking manga for updates.',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(6, {
      level: 'debug',
      mangaId: 'manga-id-2',
      mangaTitle: 'Epic Adventure Manga 2',
      oldChapters: 12,
      newChapters: 12,
      msg: 'No new chapters found.',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(7, {
      level: 'info',
      msg: 'Starting user retrieval...',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(8, {
      level: 'info',
      msg: 'Found 0 users to be notified.',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(9, {
      level: 'info',
      msg: 'Starting manga update notification...',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(10, {
      level: 'info',
      msg: 'Sent 0 emails to users.',
      serviceName: 'task:mangaUpdateChecker',
    });
  });

  it('should find an update, update DB, and identify users to notify', async () => {
    const freshChaptersCount = 12;
    mockGetMangaSuccess({
      ...manga1,
      chaptersCount: freshChaptersCount,
    });
    mockGetChaptersSuccess([
      ...manga1Chapters,
      {
        ...defaultChapter,
        id: 'chapter-id-a-11',
        mangaId: manga1.id,
        sourceId: 'chapter-source-id-a-11',
        title: `${defaultChapter.title} 11`,
        index: 11,
      },
    ]);
    mockGetMangaSuccess(manga2);

    const result = await mangaUpdater();

    expect(mockedGetManga).toHaveBeenCalledTimes(2);
    expect(mockedGetChapters).toHaveBeenCalledTimes(1);
    expect(mockedSendEmail).toHaveBeenCalledTimes(0);

    expect(result).toEqual({
      emailsSent: 0,
      updatedMangas: [{
        id: manga1.id,
        sourceName: manga1.sourceName,
        title: manga1.title,
        url: manga1.url,
        chapters: [expect.objectContaining({ index: 11 })],
        usersToNotify: [],
      }],
      errors: [],
    });

    expect(updateSpy).toHaveBeenCalledWith(mangaTable);
    const newManga1 = await db.query.mangaTable.findFirst({
      where: (manga, { eq }) => eq(manga.id, manga1.id),
    });

    expect(newManga1).toHaveProperty('chaptersCount', freshChaptersCount);

    expect(loggerWriteSpy).toHaveBeenCalledTimes(10);
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
      level: 'info',
      msg: 'Starting manga update check...',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
      level: 'info',
      msg: 'Found 2 mangas. Checking for updates...',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
      level: 'debug',
      mangaId: 'manga-id-1',
      mangaTitle: 'Epic Adventure Manga 1',
      msg: 'Checking manga for updates.',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(4, {
      level: 'info',
      mangaId: 'manga-id-1',
      mangaTitle: 'Epic Adventure Manga 1',
      oldChaptersCount: 11,
      newChaptersCount: 12,
      msg: 'Manga has new chapters.',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(5, {
      level: 'debug',
      mangaId: 'manga-id-2',
      mangaTitle: 'Epic Adventure Manga 2',
      msg: 'Checking manga for updates.',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(6, {
      level: 'debug',
      mangaId: 'manga-id-2',
      mangaTitle: 'Epic Adventure Manga 2',
      oldChapters: 12,
      newChapters: 12,
      msg: 'No new chapters found.',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(7, {
      level: 'info',
      msg: 'Starting user retrieval...',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(8, {
      level: 'info',
      msg: 'Found 0 users to be notified.',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(9, {
      level: 'info',
      msg: 'Starting manga update notification...',
      serviceName: 'task:mangaUpdateChecker',
    });
    expect(loggerWriteSpy).toHaveBeenNthCalledWith(10, {
      level: 'info',
      msg: 'Sent 0 emails to users.',
      serviceName: 'task:mangaUpdateChecker',
    });
  });

  describe('some manga should be tracked', () => {
    const lastReadChapter = 8;

    beforeEach(async () => {
      await db.insert(userMangaTable).values([{
        mangaId: manga1.id,
        userId: user1.id,
        lastReadChapter,
      }]);
    });

    it('should check a manga, find no update, and not update DB or list users', async () => {
      mockGetMangaSuccess(manga1);
      mockGetMangaSuccess(manga2);

      const result = await mangaUpdater();

      expect(mockedGetManga).toHaveBeenCalledTimes(2);
      expect(mockedGetChapters).toHaveBeenCalledTimes(0);
      expect(mockedSendEmail).toHaveBeenCalledTimes(0);

      expect(result).toEqual({
        emailsSent: 0,
        updatedMangas: [],
        errors: [],
      });

      expect(updateSpy).not.toHaveBeenCalled();

      expect(loggerWriteSpy).toHaveBeenCalledTimes(10);
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
        level: 'info',
        msg: 'Starting manga update check...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
        level: 'info',
        msg: 'Found 2 mangas. Checking for updates...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
        level: 'debug',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(4, {
        level: 'debug',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        oldChapters: 11,
        newChapters: 11,
        msg: 'No new chapters found.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(5, {
        level: 'debug',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(6, {
        level: 'debug',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        oldChapters: 12,
        newChapters: 12,
        msg: 'No new chapters found.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(7, {
        level: 'info',
        msg: 'Starting user retrieval...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(8, {
        level: 'info',
        msg: 'Found 0 users to be notified.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(9, {
        level: 'info',
        msg: 'Starting manga update notification...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(10, {
        level: 'info',
        msg: 'Sent 0 emails to users.',
        serviceName: 'task:mangaUpdateChecker',
      });
    });

    it('should find an update, update DB, and identify users to notify', async () => {
      const freshChaptersCount = 12;
      mockGetMangaSuccess({
        ...manga1,
        chaptersCount: freshChaptersCount,
      });
      mockGetChaptersSuccess([
        ...manga1Chapters,
        {
          ...defaultChapter,
          id: 'chapter-id-a-11',
          mangaId: manga1.id,
          sourceId: 'chapter-source-id-a-11',
          title: `${defaultChapter.title} 11`,
          index: 11,
        },
      ]);
      mockGetMangaSuccess(manga2);
      mockSendEmailSuccess();

      const result = await mangaUpdater();

      expect(mockedGetManga).toHaveBeenCalledTimes(2);
      expect(mockedGetChapters).toHaveBeenCalledTimes(1);
      expect(mockedSendEmail).toHaveBeenCalledTimes(1);
      expect(mockedSendEmail).toHaveBeenCalledWith({
        to: user1.email,
        subject: 'Epic Adventure Manga 1 - 11 - Epic Adventure Chapter 11',
        html: '<img src=\"image-1\" /><br />\n<img src=\"image-2\" /><br /><br />\nEpic Adventure Manga 1 - 11 - Epic Adventure Chapter 11',
        text: defaultChapter.url,
      });

      expect(result).toEqual({
        emailsSent: 1,
        updatedMangas: [{
          id: manga1.id,
          sourceName: manga1.sourceName,
          title: manga1.title,
          url: manga1.url,
          chapters: [expect.objectContaining({ index: 11 })],
          usersToNotify: [{
            id: user1.id,
            email: user1.email,
          }],
        }],
        errors: [],
      });

      expect(updateSpy).toHaveBeenCalledWith(mangaTable);
      const newManga1 = await db.query.mangaTable.findFirst({
        where: (manga, { eq }) => eq(manga.id, manga1.id),
      });

      expect(newManga1).toHaveProperty('chaptersCount', freshChaptersCount);

      expect(loggerWriteSpy).toHaveBeenCalledTimes(10);
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
        level: 'info',
        msg: 'Starting manga update check...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
        level: 'info',
        msg: 'Found 2 mangas. Checking for updates...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
        level: 'debug',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(4, {
        level: 'info',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        oldChaptersCount: 11,
        newChaptersCount: 12,
        msg: 'Manga has new chapters.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(5, {
        level: 'debug',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(6, {
        level: 'debug',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        oldChapters: 12,
        newChapters: 12,
        msg: 'No new chapters found.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(7, {
        level: 'info',
        msg: 'Starting user retrieval...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(8, {
        level: 'info',
        msg: 'Found 1 users to be notified.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(9, {
        level: 'info',
        msg: 'Starting manga update notification...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(10, {
        level: 'info',
        msg: 'Sent 1 emails to users.',
        serviceName: 'task:mangaUpdateChecker',
      });
    });

    it('should find an update, update DB, and identify users to notify, but fails sending the email', async () => {
      const freshChaptersCount = 12;
      mockGetMangaSuccess({
        ...manga1,
        chaptersCount: freshChaptersCount,
      });
      mockGetChaptersSuccess([
        ...manga1Chapters,
        {
          ...defaultChapter,
          id: 'chapter-id-a-11',
          mangaId: manga1.id,
          sourceId: 'chapter-source-id-a-11',
          title: `${defaultChapter.title} 11`,
          index: 11,
        },
      ]);
      mockGetMangaSuccess(manga2);
      mockSendEmailError();

      const result = await mangaUpdater();

      expect(mockedGetManga).toHaveBeenCalledTimes(2);
      expect(mockedGetChapters).toHaveBeenCalledTimes(1);
      expect(mockedSendEmail).toHaveBeenCalledTimes(1);
      expect(mockedSendEmail).toHaveBeenCalledWith({
        to: user1.email,
        subject: 'Epic Adventure Manga 1 - 11 - Epic Adventure Chapter 11',
        html: '<img src=\"image-1\" /><br />\n<img src=\"image-2\" /><br /><br />\nEpic Adventure Manga 1 - 11 - Epic Adventure Chapter 11',
        text: defaultChapter.url,
      });

      expect(result).toEqual({
        emailsSent: 0,
        updatedMangas: [{
          id: manga1.id,
          sourceName: manga1.sourceName,
          title: manga1.title,
          url: manga1.url,
          chapters: [expect.objectContaining({ index: 11 })],
          usersToNotify: [{
            id: user1.id,
            email: user1.email,
          }],
        }],
        errors: [{
          mangaId: 'manga-id-1',
          mangaSourceName: 'TestConnectorA',
          mangaTitle: 'Epic Adventure Manga 1',
          message: 'Email send failed',
          error: expect.any(Object),
        }],
      });

      expect(updateSpy).toHaveBeenCalledWith(mangaTable);
      const newManga1 = await db.query.mangaTable.findFirst({
        where: (manga, { eq }) => eq(manga.id, manga1.id),
      });

      expect(newManga1).toHaveProperty('chaptersCount', freshChaptersCount);

      expect(loggerWriteSpy).toHaveBeenCalledTimes(11);
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
        level: 'info',
        msg: 'Starting manga update check...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
        level: 'info',
        msg: 'Found 2 mangas. Checking for updates...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
        level: 'debug',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(4, {
        level: 'info',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        oldChaptersCount: 11,
        newChaptersCount: 12,
        msg: 'Manga has new chapters.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(5, {
        level: 'debug',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(6, {
        level: 'debug',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        oldChapters: 12,
        newChapters: 12,
        msg: 'No new chapters found.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(7, {
        level: 'info',
        msg: 'Starting user retrieval...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(8, {
        level: 'info',
        msg: 'Found 1 users to be notified.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(9, {
        level: 'info',
        msg: 'Starting manga update notification...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(10, {
        level: 'error',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        msg: 'Failed to send email to user.',
        userEmail: 'test1@example.com',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(11, {
        level: 'info',
        msg: 'Sent 0 emails to users.',
        serviceName: 'task:mangaUpdateChecker',
      });
    });

    it('should handle manga scraper error for one manga and continue with others', async () => {
      const freshChaptersCount = 12;
      mockGetMangaSuccess({
        ...manga1,
        chaptersCount: freshChaptersCount,
      });
      mockGetChaptersSuccess([
        ...manga1Chapters,
        {
          ...defaultChapter,
          id: 'chapter-id-a-11',
          mangaId: manga1.id,
          sourceId: 'chapter-source-id-a-11',
          title: `${defaultChapter.title} 11`,
          index: 11,
        },
      ]);
      mockGetMangaConnectorError();
      mockSendEmailSuccess();

      const result = await mangaUpdater();

      expect(mockedGetManga).toHaveBeenCalledTimes(2);
      expect(mockedGetChapters).toHaveBeenCalledTimes(1);
      expect(mockedSendEmail).toHaveBeenCalledTimes(1);
      expect(mockedSendEmail).toHaveBeenCalledWith({
        to: user1.email,
        subject: 'Epic Adventure Manga 1 - 11 - Epic Adventure Chapter 11',
        html: '<img src=\"image-1\" /><br />\n<img src=\"image-2\" /><br /><br />\nEpic Adventure Manga 1 - 11 - Epic Adventure Chapter 11',
        text: defaultChapter.url,
      });

      expect(result).toEqual({
        emailsSent: 1,
        updatedMangas: [{
          id: manga1.id,
          sourceName: manga1.sourceName,
          title: manga1.title,
          url: manga1.url,
          chapters: [expect.objectContaining({ index: 11 })],
          usersToNotify: [{
            id: user1.id,
            email: user1.email,
          }],
        }],
        errors: [{
          mangaId: 'manga-id-2',
          mangaSourceName: 'TestConnectorA',
          mangaTitle: 'Epic Adventure Manga 2',
          message: 'Manga fetch failed',
          error: expect.any(Object),
        }],
      });

      expect(updateSpy).toHaveBeenCalledWith(mangaTable);
      const newManga1 = await db.query.mangaTable.findFirst({
        where: (manga, { eq }) => eq(manga.id, manga1.id),
      });

      expect(newManga1).toHaveProperty('chaptersCount', freshChaptersCount);

      expect(loggerWriteSpy).toHaveBeenCalledTimes(10);
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
        level: 'info',
        msg: 'Starting manga update check...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
        level: 'info',
        msg: 'Found 2 mangas. Checking for updates...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
        level: 'debug',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(4, {
        level: 'info',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        oldChaptersCount: 11,
        newChaptersCount: 12,
        msg: 'Manga has new chapters.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(5, {
        level: 'debug',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(6, {
        level: 'error',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Failed to fetch manga details.',
        error: expect.any(Object),
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(7, {
        level: 'info',
        msg: 'Starting user retrieval...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(8, {
        level: 'info',
        msg: 'Found 1 users to be notified.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(9, {
        level: 'info',
        msg: 'Starting manga update notification...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(10, {
        level: 'info',
        msg: 'Sent 1 emails to users.',
        serviceName: 'task:mangaUpdateChecker',
      });
    });

    it('should handle chapters scraper error for one manga and continue with others', async () => {
      const freshChaptersACount = 12;
      const freshChaptersBCount = 13;
      mockGetMangaSuccess({
        ...manga1,
        chaptersCount: freshChaptersACount,
      });
      mockGetChaptersSuccess([
        ...manga1Chapters,
        {
          ...defaultChapter,
          id: 'chapter-id-a-11',
          mangaId: manga1.id,
          sourceId: 'chapter-source-id-a-11',
          title: `${defaultChapter.title} 11`,
          index: 11,
        },
      ]);
      mockGetMangaSuccess({
        ...manga2,
        chaptersCount: freshChaptersBCount,
      });
      mockGetChaptersError();
      mockSendEmailSuccess();

      const result = await mangaUpdater();

      expect(mockedGetManga).toHaveBeenCalledTimes(2);
      expect(mockedGetChapters).toHaveBeenCalledTimes(2);
      expect(mockedSendEmail).toHaveBeenCalledTimes(1);
      expect(mockedSendEmail).toHaveBeenCalledWith({
        to: user1.email,
        subject: 'Epic Adventure Manga 1 - 11 - Epic Adventure Chapter 11',
        html: '<img src=\"image-1\" /><br />\n<img src=\"image-2\" /><br /><br />\nEpic Adventure Manga 1 - 11 - Epic Adventure Chapter 11',
        text: defaultChapter.url,
      });

      expect(result).toEqual({
        emailsSent: 1,
        updatedMangas: [{
          id: manga1.id,
          sourceName: manga1.sourceName,
          title: manga1.title,
          url: manga1.url,
          chapters: [expect.objectContaining({ index: 11 })],
          usersToNotify: [{
            id: user1.id,
            email: user1.email,
          }],
        }],
        errors: [{
          mangaId: 'manga-id-2',
          mangaSourceName: 'TestConnectorA',
          mangaTitle: 'Epic Adventure Manga 2',
          message: 'Chapters fetch failed',
          error: expect.any(Object),
        }],
      });

      expect(updateSpy).toHaveBeenCalledWith(mangaTable);
      const newManga1 = await db.query.mangaTable.findFirst({
        where: (manga, { eq }) => eq(manga.id, manga1.id),
      });

      expect(newManga1).toHaveProperty('chaptersCount', freshChaptersACount);

      expect(loggerWriteSpy).toHaveBeenCalledTimes(11);
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
        level: 'info',
        msg: 'Starting manga update check...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
        level: 'info',
        msg: 'Found 2 mangas. Checking for updates...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
        level: 'debug',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(4, {
        level: 'info',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        oldChaptersCount: 11,
        newChaptersCount: 12,
        msg: 'Manga has new chapters.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(5, {
        level: 'debug',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(6, {
        level: 'info',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Manga has new chapters.',
        newChaptersCount: 13,
        oldChaptersCount: 12,
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(7, {
        level: 'error',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Failed to fetch manga chapters.',
        error: expect.any(Object),
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(8, {
        level: 'info',
        msg: 'Starting user retrieval...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(9, {
        level: 'info',
        msg: 'Found 1 users to be notified.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(10, {
        level: 'info',
        msg: 'Starting manga update notification...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(11, {
        level: 'info',
        msg: 'Sent 1 emails to users.',
        serviceName: 'task:mangaUpdateChecker',
      });
    });

    it('should handle db error for one manga and continue with others', async () => {
      const freshChaptersACount = 12;
      const freshChaptersBCount = 13;
      mockGetMangaSuccess({
        ...manga1,
        chaptersCount: freshChaptersACount,
      });
      mockGetChaptersSuccess([
        ...manga1Chapters,
        {
          ...defaultChapter,
          id: 'chapter-id-a-11',
          mangaId: manga1.id,
          sourceId: 'chapter-source-id-a-11',
          title: `${defaultChapter.title} 11`,
          index: 11,
        },
      ]);
      mockGetMangaSuccess({
        ...manga2,
        chaptersCount: freshChaptersBCount,
      });
      mockGetChaptersSuccess([
        ...manga2Chapters,
        {
          ...defaultChapter,
          id: 'chapter-id-b-12',
          mangaId: manga1.id,
          sourceId: 'chapter-source-id-b-12',
          title: `${defaultChapter.title} 12`,
          index: 12,
        },
      ]);
      mockSendEmailSuccess();

      const simulatedError = 'Simulated error';
      updateSpy.mockImplementationOnce(() => ({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValueOnce({}),
      }) as any);
      updateSpy.mockImplementationOnce(() => ({
        set: vi.fn().mockReturnThis(),
        where: vi.fn()
          .mockRejectedValueOnce(new Error(simulatedError)),
      }) as any);

      const result = await mangaUpdater();

      expect(mockedGetManga).toHaveBeenCalledTimes(2);
      expect(mockedGetChapters).toHaveBeenCalledTimes(2);

      expect(updateSpy).toHaveBeenCalledWith(mangaTable);
      expect(updateSpy).toHaveBeenCalledTimes(2);
      expect(mockedSendEmail).toHaveBeenCalledTimes(1);
      expect(mockedSendEmail).toHaveBeenCalledWith({
        to: user1.email,
        subject: 'Epic Adventure Manga 1 - 11 - Epic Adventure Chapter 11',
        html: '<img src=\"image-1\" /><br />\n<img src=\"image-2\" /><br /><br />\nEpic Adventure Manga 1 - 11 - Epic Adventure Chapter 11',
        text: defaultChapter.url,
      });

      expect(result).toEqual({
        emailsSent: 1,
        updatedMangas: [{
          id: manga1.id,
          sourceName: manga1.sourceName,
          title: manga1.title,
          url: manga1.url,
          chapters: [expect.objectContaining({ index: 11 })],
          usersToNotify: [{
            id: user1.id,
            email: user1.email,
          }],
        }],
        errors: [{
          mangaId: manga2.id,
          mangaSourceName: manga2.sourceName,
          mangaTitle: manga2.title,
          message: 'Failed to update manga in DB',
          error: expect.any(Object),
        }],
      });

      expect(loggerWriteSpy).toHaveBeenCalledTimes(11);
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
        level: 'info',
        msg: 'Starting manga update check...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
        level: 'info',
        msg: 'Found 2 mangas. Checking for updates...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
        level: 'debug',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(4, {
        level: 'info',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        oldChaptersCount: 11,
        newChaptersCount: 12,
        msg: 'Manga has new chapters.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(5, {
        level: 'debug',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(6, {
        level: 'info',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Manga has new chapters.',
        newChaptersCount: 13,
        oldChaptersCount: 12,
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(7, {
        level: 'error',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Failed to update manga in DB.',
        error: expect.any(Object),
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(8, {
        level: 'info',
        msg: 'Starting user retrieval...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(9, {
        level: 'info',
        msg: 'Found 1 users to be notified.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(10, {
        level: 'info',
        msg: 'Starting manga update notification...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(11, {
        level: 'info',
        msg: 'Sent 1 emails to users.',
        serviceName: 'task:mangaUpdateChecker',
      });
    });

    it('should handle db error for one manga chapters and continue with others', async () => {
      const freshChaptersACount = 12;
      const freshChaptersBCount = 13;
      mockGetMangaSuccess({
        ...manga1,
        chaptersCount: freshChaptersACount,
      });
      mockGetChaptersSuccess([
        ...manga1Chapters,
        {
          ...defaultChapter,
          id: 'chapter-id-a-11',
          mangaId: manga1.id,
          sourceId: 'chapter-source-id-a-11',
          title: `${defaultChapter.title} 11`,
          index: 11,
        },
      ]);
      mockGetMangaSuccess({
        ...manga2,
        chaptersCount: freshChaptersBCount,
      });
      mockGetChaptersSuccess([
        ...manga2Chapters,
        {
          ...defaultChapter,
          id: 'chapter-id-b-12',
          mangaId: manga1.id,
          sourceId: 'chapter-source-id-b-12',
          title: `${defaultChapter.title} 12`,
          index: 12,
        },
      ]);
      mockSendEmailSuccess();

      const simulatedError = 'Simulated error';
      insertSpy.mockImplementationOnce(() => ({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValueOnce([{
          ...defaultChapter,
          id: 'chapter-id-a-11',
          mangaId: manga1.id,
          sourceId: 'chapter-source-id-a-11',
          title: `${defaultChapter.title} 11`,
          index: 11,
        }]),
      }) as any);
      insertSpy.mockImplementationOnce(() => ({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn()
          .mockRejectedValueOnce(new Error(simulatedError)),
      }) as any);

      const result = await mangaUpdater();

      expect(mockedGetManga).toHaveBeenCalledTimes(2);
      expect(mockedGetChapters).toHaveBeenCalledTimes(2);

      expect(updateSpy).toHaveBeenCalledWith(mangaTable);
      expect(updateSpy).toHaveBeenCalledTimes(2);
      expect(mockedSendEmail).toHaveBeenCalledTimes(1);
      expect(mockedSendEmail).toHaveBeenCalledWith({
        to: user1.email,
        subject: 'Epic Adventure Manga 1 - 11 - Epic Adventure Chapter 11',
        html: '<img src=\"image-1\" /><br />\n<img src=\"image-2\" /><br /><br />\nEpic Adventure Manga 1 - 11 - Epic Adventure Chapter 11',
        text: defaultChapter.url,
      });

      expect(result).toEqual({
        emailsSent: 1,
        updatedMangas: [{
          id: manga1.id,
          sourceName: manga1.sourceName,
          title: manga1.title,
          url: manga1.url,
          chapters: [expect.objectContaining({ index: 11 })],
          usersToNotify: [{
            id: user1.id,
            email: user1.email,
          }],
        }],
        errors: [{
          mangaId: manga2.id,
          mangaSourceName: manga2.sourceName,
          mangaTitle: manga2.title,
          message: 'Failed to insert new chapters in DB',
          error: expect.any(Object),
        }],
      });

      expect(loggerWriteSpy).toHaveBeenCalledTimes(11);
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(1, {
        level: 'info',
        msg: 'Starting manga update check...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(2, {
        level: 'info',
        msg: 'Found 2 mangas. Checking for updates...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(3, {
        level: 'debug',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(4, {
        level: 'info',
        mangaId: 'manga-id-1',
        mangaTitle: 'Epic Adventure Manga 1',
        oldChaptersCount: 11,
        newChaptersCount: 12,
        msg: 'Manga has new chapters.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(5, {
        level: 'debug',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Checking manga for updates.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(6, {
        level: 'info',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Manga has new chapters.',
        newChaptersCount: 13,
        oldChaptersCount: 12,
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(7, {
        level: 'error',
        mangaId: 'manga-id-2',
        mangaTitle: 'Epic Adventure Manga 2',
        msg: 'Failed to insert new chapters in DB.',
        error: expect.any(Object),
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(8, {
        level: 'info',
        msg: 'Starting user retrieval...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(9, {
        level: 'info',
        msg: 'Found 1 users to be notified.',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(10, {
        level: 'info',
        msg: 'Starting manga update notification...',
        serviceName: 'task:mangaUpdateChecker',
      });
      expect(loggerWriteSpy).toHaveBeenNthCalledWith(11, {
        level: 'info',
        msg: 'Sent 1 emails to users.',
        serviceName: 'task:mangaUpdateChecker',
      });
    });
  });
});
```

---

lib/service/mangaUpdater.ts:

```ts
import type { ChapterInsert, Manga, MangaInsert, User } from '@/lib/db/model';

import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { chapterTable, mangaTable } from '@/lib/db/model';
import { sendEmail } from '@/lib/email';
import { createChildLogger } from '@/lib/log';
import { getChapter, getChapters, getManga } from '@/lib/manga';

const logger = createChildLogger('task:mangaUpdateChecker');

type UserToNotify = Pick<User, 'id' | 'email'>;

interface MangaUpdate extends Pick<Manga, 'sourceName' | 'id' | 'title' | 'url'> {
  chapters: ChapterInsert[];
  usersToNotify: UserToNotify[];
}

interface MangaError {
  mangaSourceName: Manga['sourceName'];
  mangaId: Manga['id'];
  mangaTitle: Manga['title'];
  message: string;
  error: Error;
}

interface MangaUpdaterResult {
  emailsSent: number;
  updatedMangas: MangaUpdate[];
  errors: MangaError[];
}

async function checkMangasForUpdates(result: MangaUpdaterResult): Promise<void> {
  logger.info('Starting manga update check...');

  const mangas = await db.query.mangaTable.findMany({
    orderBy: (mangaTable, { asc }) => asc(mangaTable.lastCheckedAt),
    limit: 10,
    with: {
      chapters: {
        limit: 1,
        orderBy: (chapterTable, { desc }) => desc(chapterTable.index),
      },
    },
  });

  logger.info(`Found ${mangas.length} mangas. Checking for updates...`);

  for (const manga of mangas) {
    logger.debug({ mangaId: manga.id, mangaTitle: manga.title }, 'Checking manga for updates.');

    const lastChapterIndex = (manga.chapters.length && manga.chapters[0].index) ?? 0;
    let freshManga: MangaInsert;

    try {
      freshManga = await getManga(manga.sourceName, manga.sourceId);
    } catch (error) {
      logger.error({ mangaId: manga.id, mangaTitle: manga.title, error }, 'Failed to fetch manga details.');

      result.errors.push({
        mangaSourceName: manga.sourceName,
        mangaId: manga.id,
        mangaTitle: manga.title,
        message: 'Manga fetch failed',
        error: error as Error,
      });

      continue;
    }

    const oldChaptersCount = manga.chaptersCount ?? 0;
    const newChaptersCount = freshManga.chaptersCount ?? 0;
    let newChapters: ChapterInsert[] = [];

    if (newChaptersCount > oldChaptersCount) {
      logger.info({
        mangaId: manga.id,
        mangaTitle: manga.title,
        oldChaptersCount,
        newChaptersCount,
      }, 'Manga has new chapters.');

      try {
        const chapters = await getChapters(manga.sourceName, manga.sourceId);
        newChapters = await Promise.all(chapters
          .filter(chapter => chapter.index! > lastChapterIndex)
          .map(
            async chapter => chapter.images && chapter.images.length > 0
              ? chapter
              : getChapter(manga.sourceName, manga.sourceId, chapter.sourceId),
          ));
      } catch (error) {
        logger.error({ mangaId: manga.id, mangaTitle: manga.title, error }, 'Failed to fetch manga chapters.');

        result.errors.push({
          mangaSourceName: manga.sourceName,
          mangaId: manga.id,
          mangaTitle: manga.title,
          message: 'Chapters fetch failed',
          error: error as Error,
        });

        continue;
      }
    } else {
      logger.debug({
        mangaId: manga.id,
        mangaTitle: manga.title,
        oldChapters: oldChaptersCount,
        newChapters: newChaptersCount,
      }, 'No new chapters found.');

      continue;
    }

    try {
      await db.update(mangaTable).set({ lastCheckedAt: new Date(), chaptersCount: newChaptersCount }).where(eq(mangaTable.id, manga.id));
    } catch (error) {
      logger.error({ mangaId: manga.id, mangaTitle: manga.title, error }, 'Failed to update manga in DB.');

      result.errors.push({
        mangaSourceName: manga.sourceName,
        mangaId: manga.id,
        mangaTitle: manga.title,
        message: 'Failed to update manga in DB',
        error: error as Error,
      });

      continue;
    }

    try {
      const chapters = await db.insert(chapterTable).values(newChapters).returning();

      result.updatedMangas.push({
        sourceName: manga.sourceName,
        id: manga.id,
        title: manga.title,
        url: manga.url,
        chapters,
        usersToNotify: [],
      });
    } catch (error) {
      logger.error({ mangaId: manga.id, mangaTitle: manga.title, error }, 'Failed to insert new chapters in DB.');

      result.errors.push({
        mangaSourceName: manga.sourceName,
        mangaId: manga.id,
        mangaTitle: manga.title,
        message: 'Failed to insert new chapters in DB',
        error: error as Error,
      });
    }
  }
}

async function retrieveUsersForUpdates(result: MangaUpdaterResult): Promise<void> {
  logger.info('Starting user retrieval...');

  const mangaIds = result.updatedMangas.map(manga => manga.id);
  const userMangas = await db.query.userMangaTable.findMany({
    where: (userMangaTable, { inArray }) => inArray(userMangaTable.mangaId, mangaIds),
    with: {
      user: true,
    },
  });

  userMangas.forEach((userManga) => {
    const manga = result.updatedMangas.find(manga => manga.id === userManga.mangaId);
    if (!manga) {
      return;
    }

    manga.usersToNotify.push({
      id: userManga.user.id,
      email: userManga.user.email,
    });
  });

  logger.info(`Found ${userMangas.length} users to be notified.`);
}

async function notifyUsersForUpdates(result: MangaUpdaterResult): Promise<void> {
  logger.info('Starting manga update notification...');

  for (const manga of result.updatedMangas) {
    if (manga.usersToNotify.length === 0) {
      continue;
    }

    for (const chapter of manga.chapters) {
      let subject = `${manga.title} - ${chapter.index}`;
      if (chapter.title != null) {
        subject += ` - ${chapter.title}`;
      }

      const imagesHtml = chapter.images!.map(image => `<img src="${image}" />`).join('<br />\n');
      const html = `${imagesHtml}<br /><br />\n${subject}`;

      for (const user of manga.usersToNotify) {
        const isEmailSent = await sendEmail({
          to: user.email,
          subject,
          html,
          text: chapter.url ?? '',
        });

        if (isEmailSent) {
          result.emailsSent++;
        } else {
          logger.error({
            mangaId: manga.id,
            mangaTitle: manga.title,
            userEmail: user.email,
          }, 'Failed to send email to user.');

          result.errors.push({
            mangaSourceName: manga.sourceName,
            mangaId: manga.id,
            mangaTitle: manga.title,
            message: 'Email send failed',
            error: new Error('Email send failed'),
          });
        }
      }
    }
  }

  logger.info(`Sent ${result.emailsSent} emails to users.`);
}

export async function mangaUpdater(): Promise<MangaUpdaterResult> {
  const result: MangaUpdaterResult = {
    emailsSent: 0,
    updatedMangas: [],
    errors: [],
  };

  await checkMangasForUpdates(result);
  await retrieveUsersForUpdates(result);
  await notifyUsersForUpdates(result);

  return result;
}
```

---

lib/validation/user.test.ts:

```ts
import { describe, expect, it } from 'vitest';

import { userValidation } from '@/lib/validation/user';

describe('validation -> user', () => {
  it('should validate a correct full user input', () => {
    const result = userValidation.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      telegramId: 12345,
    });
    expect(result.success).toBe(true);
  });

  it('should allow partial input (as schema uses .partial())', () => {
    const partialInput = { name: 'Only Name' };
    const result = userValidation.safeParse(partialInput);

    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('data.name', partialInput.name);
  });

  describe('name validation', () => {
    it('should accept a valid name', () => {
      const result = userValidation.safeParse({ name: 'Valid Name' });
      expect(result).toHaveProperty('success', true);
    });

    it('should not accept an empty name', () => {
      const result = userValidation.safeParse({ name: '' });
      expect(result).toHaveProperty('success', false);
    });
  });

  describe('email validation', () => {
    it('should accept a valid email', () => {
      const result = userValidation.safeParse({ email: 'valid@email.com' });
      expect(result).toHaveProperty('success', true);
    });

    it('should reject an invalid email format', () => {
      const result = userValidation.safeParse({ email: 'invalid-email' });
      expect(result).toHaveProperty('success', false);
      if (result.success) {
        throw new Error('Test failed');
      }
      expect(result).toHaveProperty('error.errors', expect.arrayContaining([
        expect.objectContaining({
          path: ['email'],
          message: 'Invalid email address',
        }),
      ]));
    });

    it('should reject an email without domain', () => {
      const result = userValidation.safeParse({ email: 'test@' });
      expect(result).toHaveProperty('success', false);
      if (result.success) {
        throw new Error('Test failed');
      }
      expect(result).toHaveProperty('error.errors', expect.arrayContaining([
        expect.objectContaining({
          path: ['email'],
          message: 'Invalid email address',
        }),
      ]));
    });

    it('should reject an email without @ symbol', () => {
      const result = userValidation.safeParse({ email: 'testexample.com' });
      expect(result).toHaveProperty('success', false);
      if (result.success) {
        throw new Error('Test failed');
      }
      expect(result).toHaveProperty('error.errors', expect.arrayContaining([
        expect.objectContaining({
          path: ['email'],
          message: 'Invalid email address',
        }),
      ]));
    });
  });

  describe('telegramId validation', () => {
    it('should accept a valid telegramId (number)', () => {
      const result = userValidation.safeParse({ telegramId: 123456789 });
      expect(result.success).toBe(true);
    });

    it('should reject a string as telegramId', () => {
      const result = userValidation.safeParse({ telegramId: '12345' });
      expect(result).toHaveProperty('success', false);
      if (result.success) {
        throw new Error('Test failed');
      }
      expect(result).toHaveProperty('error.errors', expect.arrayContaining([
        expect.objectContaining({
          path: ['telegramId'],
          message: 'Expected number, received string',
        }),
      ]));
    });
  });

  it('should correctly report multiple errors', () => {
    const veryInvalidInput = {
      email: 'invalid',
      telegramId: 'not-a-number',
    };
    const result = userValidation.safeParse(veryInvalidInput);
    expect(result).toHaveProperty('success', false);
    if (result.success) {
      throw new Error('Test failed');
    }
    expect(result.error.errors).toHaveLength(2);
    expect(result.error.flatten().fieldErrors.email).toBeDefined();
    expect(result.error.flatten().fieldErrors.telegramId).toBeDefined();
  });
});
```

---

lib/validation/user.ts:

```ts
import * as z from 'zod';

export const userValidation = z.object({
  name: z.string().min(1),
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
    "test": "vitest run",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
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
    "nodemailer": "^7.0.3",
    "pino": "^9.6.0",
    "ws": "^8.18.2",
    "zod": "^3.24.4"
  },
  "devDependencies": {
    "@antfu/eslint-config": "^4.13.0",
    "@eslint-react/eslint-plugin": "^1.49.0",
    "@next/eslint-plugin-next": "^15.3.2",
    "@types/node": "^20",
    "@types/nodemailer": "^6.4.17",
    "@types/react": "^19",
    "@types/ws": "^8.18.1",
    "@vitest/coverage-v8": "^3.2.2",
    "dotenv": "^16.5.0",
    "dree": "^5.1.5",
    "drizzle-kit": "^0.31.1",
    "drizzle-orm": "^0.43.1",
    "esbuild-register": "^3.6.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "husky": "^9.1.7",
    "ignore": "^7.0.4",
    "pino-pretty": "^13.0.0",
    "typescript": "^5",
    "vite-tsconfig-paths": "^5.1.4",
    "vitest": "^3.2.2"
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

import { parse } from 'dree';
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
const files = readdirSync(rootFolder, { recursive: true, encoding: 'utf-8' });

const files2export = ignore()
  .add(ignoreFile)
  .filter(files)
  .sort();

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

const tree = parse(rootFolder, {
  exclude: [
    /\.git/,
    /\.husky\/_/,
    /\.next/,
    /\.vercel/,
    /coverage/,
    /node_modules/,
  ],
});

const exportString = `# EXPORT

## File structure

\`\`\`
${tree}
\`\`\`

## File export

${filesExport}`;

writeFileSync(exportFilename, exportString, { encoding: 'utf-8' });
```

---

test/log/index.ts:

```ts
import { vi } from 'vitest';

export const loggerWriteSpy = vi.fn();
```

---

test/mocks/bot/context.ts:

```ts
import type { Conversation, ConversationControls } from '@grammyjs/conversations';
import type { Api, CallbackQueryContext, CommandContext, RawApi } from 'grammy';
import type { Message } from 'grammy/types';
import type { Mocked } from 'vitest';

import type { BotContext } from '@/lib/bot/types';

import { vi } from 'vitest';

export type MockMessageContext = BotContext;
export type MockCommandContext = CommandContext<BotContext>;
export type MockCallbackQueryContext = CallbackQueryContext<BotContext>;

function createBaseMockContext(chatId: number, userId: number): Partial<BotContext> {
  return {
    chat: { id: chatId, type: 'private', first_name: 'Test', username: 'testuser' },
    from: { id: userId, is_bot: false, first_name: 'Test', username: 'testuser' },
    reply: vi.fn().mockResolvedValue(true),
    conversation: {
      enter: vi.fn().mockResolvedValue(undefined),
      exit: vi.fn().mockResolvedValue(undefined),
      active: vi.fn().mockReturnValue({}),
      waitFor: vi.fn(),
      external: vi.fn(async callback => callback()),
      checkpoint: vi.fn(),
      rewind: vi.fn().mockResolvedValue(undefined),
    } as unknown as ConversationControls,
    api: {
      raw: vi.fn().mockResolvedValue({ ok: true, result: true }),
      call: vi.fn().mockResolvedValue({ ok: true, result: true }),
    } as unknown as Api<RawApi>,
    answerCallbackQuery: vi.fn().mockResolvedValue(true),
    editMessageText: vi.fn().mockResolvedValue(true),
    editMessageReplyMarkup: vi.fn().mockResolvedValue(true),
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
    answerCallbackQuery: vi.fn().mockResolvedValue(true),
    editMessageText: vi.fn().mockResolvedValue(true),
  } as MockCallbackQueryContext;
}

export function createMockConversationControl(): Mocked<Conversation> {
  return {
    waitFor: vi.fn(),
    external: vi.fn(async (callback: () => any) => callback()),
    checkpoint: vi.fn(),
    rewind: vi.fn().mockResolvedValue(undefined),
    log: vi.fn(),
    skip: vi.fn(),
    wait: vi.fn().mockResolvedValue(undefined),
  } as any;
}
```

---

test/mocks/db/manga.ts:

```ts
import type { Manga } from '@/lib/db/model';

import { vi } from 'vitest';

import { listTrackedMangas, removeTrackedManga, trackManga } from '@/lib/db/action/manga';
import { defaultManga } from '@/test/mocks/manga';

// vi.mock('@/lib/db/action/manga', () => ({
//   listTrackedMangas: vi.fn(),
//   removeTrackedManga: vi.fn(),
//   trackManga: vi.fn(),
// }));

export const mockedListTrackedMangas = vi.mocked(listTrackedMangas);
export const mockedTrackManga = vi.mocked(trackManga);
export const mockedRemoveTrackedManga = vi.mocked(removeTrackedManga);

export function mockListTrackedMangasSuccess(partialMangas: Partial<Manga>[] = []): Manga[] {
  const mangas: Manga[] = partialMangas.map(manga => ({ ...defaultManga, ...manga }));
  mockedListTrackedMangas.mockResolvedValue(mangas);

  return mangas;
}

export function mockTrackMangaSuccess(): void {
  mockedTrackManga.mockResolvedValue({ success: true });
}
export function mockTrackMangaInvalidUser(): void {
  mockedTrackManga.mockResolvedValue({ success: false, alreadyTracked: false });
}
export function mockTrackMangaAlreadyTracked(): void {
  mockedTrackManga.mockResolvedValue({ success: false, alreadyTracked: true });
}
export function mockTrackMangaDbError(databaseError = 'DB error'): void {
  mockedTrackManga.mockResolvedValue({ success: false, alreadyTracked: false, databaseError });
}

export function mockRemoveTrackedMangaSuccess(): void {
  mockedRemoveTrackedManga.mockResolvedValue({ success: true });
}
export function mockRemoveTrackedMangaNotFound(): void {
  mockedRemoveTrackedManga.mockResolvedValue({ success: false, notFound: true });
}
export function mockRemoveTrackedMangaDbError(databaseError = 'DB error'): void {
  mockedRemoveTrackedManga.mockResolvedValue({ success: false, notFound: false, databaseError });
}
```

---

test/mocks/db/user.ts:

```ts
import type { User } from '@/lib/db/model';

import { vi } from 'vitest';

import { findUserByTelegramId, upsertUser } from '@/lib/db/action/user';

// vi.mock('@/lib/db/action/user', () => ({
//   findUserByTelegramId: vi.fn(),
//   upsertUser: vi.fn(),
// }));

export const mockedFindUserByTelegramId = vi.mocked(findUserByTelegramId);
export const mockedUpsertUser = vi.mocked(upsertUser);

export const defaultUser: User = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  telegramId: 12345,
  createdAt: new Date(),
  updatedAt: null,
  emailVerified: null,
  image: null,
};
export function mockFindUserByTelegramIdSuccess(partialUser: Partial<User> = {}): User {
  const user: User = { ...defaultUser, ...partialUser };
  mockedFindUserByTelegramId.mockResolvedValue(user);

  return user;
}
export function mockFindUserByTelegramIdNotFound(): void {
  mockedFindUserByTelegramId.mockResolvedValue(undefined);
}

export function mockUpsertUserSuccess(): void {
  mockedUpsertUser.mockResolvedValue({ success: true });
}
export function mockUpsertUserValidationError(validationErrors = [{ field: 'email', error: 'Invalid format' }]): void {
  mockedUpsertUser.mockResolvedValue({ success: false, validationErrors });
}
export function mockUpsertUserDbError(databaseError = 'DB error'): void {
  mockedUpsertUser.mockResolvedValue({ success: false, databaseError });
}
```

---

test/mocks/email.ts:

```ts
import { vi } from 'vitest';

import { sendEmail } from '@/lib/email';

// vi.mock('@/lib/email', () => ({
//   sendEmail: vi.fn(),
// }));

export const mockedSendEmail = vi.mocked(sendEmail);

export function mockSendEmailSuccess(): void {
  mockedSendEmail.mockResolvedValueOnce(true);
}
export function mockSendEmailError(): void {
  mockedSendEmail.mockResolvedValueOnce(false);
}
```

---

test/mocks/manga.ts:

```ts
import type { ConnectorNames } from '@zweer/manga-scraper';

import type { Chapter, Manga, MangaInsert } from '@/lib/db/model';
import type { MangaAutocomplete } from '@/lib/manga';

import { vi } from 'vitest';

import { getChapter, getChapters, getManga, searchMangas } from '@/lib/manga';

// vi.mock('@/lib/manga', () => ({
//   getManga: vi.fn(),
//   searchMangas: vi.fn(),
//   getChapters: vi.fn(),
//   getChapter: vi.fn(),
// }));

export const mockedGetManga = vi.mocked(getManga);
export const mockedSearchMangas = vi.mocked(searchMangas);
export const mockedGetChapters = vi.mocked(getChapters);
export const mockedGetChapter = vi.mocked(getChapter);

export const testConnectorNameA = 'TestConnectorA' as ConnectorNames;

export const defaultManga: Manga = {
  id: 'manga-id-123',
  sourceName: testConnectorNameA,
  sourceId: 'manga-source-id-123',
  title: 'Epic Adventure Manga',
  chaptersCount: 10,
  slug: 'epic-adventure',
  author: 'A. Uthor',
  artist: 'A. Rtist',
  excerpt: 'An epic excerpt.',
  image: 'url.jpg',
  url: 'manga.url',
  status: 'Ongoing',
  genres: ['action'],
  score: 0,
  releasedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  lastCheckedAt: new Date(),
};

export const defaultChapter: Chapter = {
  id: 'chapter-id-123',
  sourceName: testConnectorNameA,
  sourceId: 'chapter-source-id-123',
  mangaId: 'manga-id-123',
  title: 'Epic Adventure Chapter',
  index: 1,
  url: 'chapter.url',
  releasedAt: new Date(),
  images: ['image-1', 'image-2'],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export function mockGetMangaSuccess(partialManga: Partial<MangaInsert> = {}): Manga {
  const manga: Manga = { ...defaultManga, ...partialManga };
  mockedGetManga.mockResolvedValueOnce(manga);

  return manga;
}
export function mockGetMangaConnectorError(message = 'Invalid connector name'): void {
  mockedGetManga.mockRejectedValueOnce(new Error(message));
}

export function mockSearchMangaSuccess(partialAutocompleteMangas: Partial<MangaAutocomplete>[] = []): MangaAutocomplete[] {
  const autocompleteMangas: MangaAutocomplete[] = partialAutocompleteMangas.map(manga => ({
    connectorName: testConnectorNameA,
    id: defaultManga.sourceId,
    title: defaultManga.title as string,
    chaptersCount: defaultManga.chaptersCount as number,
    ...manga,
  }));
  mockedSearchMangas.mockResolvedValueOnce(autocompleteMangas);

  return autocompleteMangas;
}
export function mockSearchMangaError(message = 'Search error'): void {
  mockedSearchMangas.mockRejectedValueOnce(new Error(message));
}

export function mockGetChaptersSuccess(partialChapters: Partial<Chapter>[] = []): Chapter[] {
  const chapters: Chapter[] = partialChapters.map(chapter => ({ ...defaultChapter, ...chapter }));
  mockedGetChapters.mockResolvedValueOnce(chapters);

  return chapters;
}
export function mockGetChaptersError(message = 'Fetch error'): void {
  mockedGetChapters.mockRejectedValueOnce(new Error(message));
}

export function mockGetChapterSuccess(partialChapter: Partial<Chapter> = {}): Chapter {
  const chapter: Chapter = { ...defaultChapter, ...partialChapter };
  mockedGetChapter.mockResolvedValueOnce(chapter);

  return chapter;
}
export function mockGetChapterError(message = 'Fetch error'): void {
  mockedGetChapter.mockRejectedValueOnce(new Error(message));
}
```

---

test/setup.ts:

```ts
import type { Logger } from 'pino';

import { resolve } from 'node:path';

import { PgTable } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import pino from 'pino';
import { afterAll, afterEach, beforeEach, vi } from 'vitest';

import * as schema from '@/lib/db/model';
import { loggerWriteSpy } from '@/test/log';

vi.mock('@/lib/db', async () => {
  const { PGlite } = await import('@electric-sql/pglite');
  const pgliteInstance = new PGlite(undefined, { debug: 0 });
  const testDbInstance = drizzle(pgliteInstance, { schema, logger: false });

  const migrationsFolder = resolve(__dirname, '..', 'drizzle');
  await migrate(testDbInstance, { migrationsFolder });

  return {
    db: testDbInstance,
  };
});

vi.mock(import('@/lib/log'), async (importOriginal) => {
  const { createChildLogger: actualCreateChildLogger } = await importOriginal();
  const logger = pino({
    level: 'trace',
    timestamp: false,
    base: null,
    formatters: {
      level: label => ({ level: label }),
      log: object => object,
    },
  }, {
    write(msg: string) {
      loggerWriteSpy(JSON.parse(msg));
    },
  });

  return {
    createChildLogger(serviceName: string): Logger {
      return actualCreateChildLogger(serviceName, logger);
    },
  };
});

export async function resetDatabase() {
  const { db } = await import('@/lib/db');

  await Object.values(schema)
    .filter(table => table instanceof PgTable)
    .reduce(async (promise, table) => {
      await promise;
      await db.delete(table);
    }, Promise.resolve());
}

beforeEach(async () => {
  await resetDatabase();
});

afterEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  vi.restoreAllMocks();
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

---

vercel.json:

```json
{
  "version": 2,
  "crons": [
    {
      "path": "/api/cron/manga-updates",
      "schedule": "0 * * * *"
    }
  ]
}
```

---

vitest.config.ts:

```ts
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',

        'drizzle.config.ts',
        'eslint.config.mjs',
        'next-env.d.ts',
        'next.config.ts',
        'instrumentation.ts',
        '.next',
        'lib/db/index.ts',
        'lib/log.ts',
        'script',
        'test/**/*',
        'e2e/**/*',
      ],
    },
  },
});
```
