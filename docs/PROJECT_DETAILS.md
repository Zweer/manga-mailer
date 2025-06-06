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
