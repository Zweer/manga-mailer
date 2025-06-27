# Project "Manga Tracker" - TODO List (v2)

This document outlines the development phases and tasks for creating the Manga Tracker, based on the revised, source-specific schema.

## Phase 0: Foundation & Setup

This phase focuses on setting up the project structure, database schema, and core configurations.

-   [X] **Project Initialization**:
    -   [X] Next.js project setup.
    -   [X] Vercel hosting configured.
    -   [X] `next-auth@beta` dependency added.
    -   [X] `drizzle-orm` and `postgres` dependencies added.
    -   [X] `grammy` dependency added.

-   [X] **Database Schema (Drizzle)**:
    -   [X] Finalize and review the Next-Auth schema files (`userTable`, `accountTable`, etc.).
    -   [X] Implement the revised schema for manga tracking:
        -   **`userTable`**: With `telegramId` field.
        -   **`mangaTable`**: Represents a manga from a single source. Includes `sourceName`, `sourceId`, `slug`, and denormalized fields like `lastChapterIndex` and `lastCheckedAt`. Ensure `uniqueIndex` on `(sourceName, sourceId)`.
        -   **`chapterTable`**: Represents a chapter from a source. Includes a foreign key `mangaId`, and a unique identifier for the chapter on the source platform (e.g., `sourceChapterId`).
        -   **`watchlistTable`**: The M:N join table between `userTable` and `mangaTable`.
    -   [X] Define all Drizzle `relations` between the tables.
    -   [X] Run `drizzle-kit push:pg` to sync the final schema with the database.

-   [X] **Environment Variables**:
    -   [X] Set up `.env` for development.
    -   [X] Define `DATABASE_URL`, `TELEGRAM_BOT_TOKEN`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.
    -   [X] Configure secrets in Vercel for production.

-   [X] **Scraper Library Integration**:
    -   [X] Ensure `@zweer/manga-scraper` is a dependency.
    -   [ ] Create a factory or registry module to easily access instances of all available connectors (e.g., `getConnector(sourceName)`).

## Phase 1: The Core Engine (Scraping & Notifications)

This phase builds the background process that finds and registers new chapters.

-   [ ] **Create the Cron Job API Route**:
    -   [ ] Create an API route, e.g., `/api/cron/check-updates`.
    -   [ ] Secure this endpoint (e.g., with a secret key passed in the request) to prevent public abuse.

-   [ ] **Implement the Cron Job Logic**:
    -   [ ] Fetch all entries from `mangaTable`, potentially filtering/ordering by `lastCheckedAt` to prioritize.
    -   [ ] For each `manga` record:
        -   Use `manga.sourceName` to get the correct scraper connector instance.
        -   Call the connector's method to fetch the list of chapters for that `manga.sourceId`.
        -   Compare the fetched chapters with the `manga.lastChapterIndex` or the existing chapters in `chapterTable`.
        -   For each new chapter found:
            -   [ ] Save the new chapter details into `chapterTable`, linking it to the `manga.id`.
            -   [ ] **Trigger a notification event** (e.g., push to a queue like Vercel KV or Upstash QStash).
        -   [ ] After checking, update the `manga` record in the database: set the new `lastChapterIndex`, `totalChapters`, and update `lastCheckedAt`.

-   [ ] **Implement the Notification Logic**:
    -   [ ] This function/job will receive a `chapterId`.
    -   [ ] From the `chapterId`, query the database to get its parent `mangaId` and title.
    -   [ ] Query `watchlistTable` to find all `userId`s subscribed to that `mangaId`.
    -   [ ] For each `userId`, fetch the `telegramId` from `userTable`.
    -   [ ] Using the Grammy bot instance, send a formatted notification message to each `telegramId`.

-   [ ] **Configure Vercel Cron Job**:
    -   [ ] Add the cron job configuration to `vercel.json` to call the `/api/cron/check-updates` endpoint on a regular schedule.

## Phase 2: Telegram Bot Interface

This phase focuses on building the user-facing bot commands.

-   [X] **Setup Grammy Bot Handler**:
    -   [X] Create an API route (e.g., `/api/bot`) to handle Telegram webhooks.
    -   [X] Initialize the Grammy bot instance and set up the webhook.

-   [ ] **Implement `/start` Command**:
    -   [ ] Create a conversation flow (`grammy/conversations`).
    -   [ ] Greet the user and ask for their email.
    -   [ ] Implement logic to find/create/update the user in `userTable`, linking their email and `telegramId`.
    -   [ ] Store the `userId` from your database in the bot's session for subsequent commands.

-   [ ] **Implement `/track <query>` Command**:
    -   [ ] Create a `/api/manga/search` API route that the bot calls. This API queries all connectors and returns a deduplicated list of potential manga.
    -   [ ] The bot presents the results to the user with an `InlineKeyboard` for selection.
    -   [ ] Handle the user's selection (callback query) by calling another API route, e.g., `/api/manga/track`.
    -   [ ] The `/api/manga/track` endpoint will:
        -   Check if the manga (`sourceName`, `sourceId`) already exists in `mangaTable`. If not, create it by scraping its details.
        -   Get the `manga.id`.
        -   Create an entry in `watchlistTable` linking the `userId` and `manga.id`.
        -   Send a confirmation message back to the user via the bot.

-   [ ] **Implement `/list` Command**:
    -   [ ] Query the `watchlistTable` for the current `userId`, join with `mangaTable` to get titles, and send the formatted list to the user.

-   [ ] **Implement `/delete` Command**:
    -   [ ] Show the user their watchlist as an `InlineKeyboard`.
    -   [ ] On selection, remove the corresponding entry from `watchlistTable` and send confirmation.

## Phase 3: Future Work & Enhancements

Items to be considered after the core functionality is stable.

-   [ ] **Email Notifications**: Integrate a service like Resend, extend the scraper for images, and create email templates.
-   [ ] **Image Persistence**: Integrate a blob storage solution (Vercel Blob, Cloudflare R2) to self-host chapter images for reliability.
-   [ ] **Web Portal**: Build the full web application with `next-auth`, dashboard, web reader, and read progress tracking.
-   [ ] **Schema Evolution**: Re-evaluate the "abstract manga" model if the need arises to link multiple sources to a single canonical manga entry.
