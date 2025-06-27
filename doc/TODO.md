# Project "Manga Portal" - TODO List

This document outlines the development phases and tasks for creating the Manga Portal, starting with a Telegram bot and its backend infrastructure.

## Phase 0: Foundation & Setup

This phase focuses on setting up the project structure, database schema, and core configurations.

-   [X] **Project Initialization**:
    -   [X] Next.js project setup.
    -   [X] Vercel hosting configured.
    -   [X] `next-auth@beta` dependency added.
    -   [X] `drizzle-orm` and `postgres` dependencies added.
    -   [X] `grammy` dependency added.

-   [ ] **Database Schema (Drizzle)**:
    -   [X] Finalize the Next-Auth schema files (`userTable`, `accountTable`, etc.).
    -   [ ] Modify `userTable`: add a `telegramId: text('telegram_id').unique()` column to link Telegram users to the main user entity.
    -   [ ] Create `mangaTable`: The abstract, canonical manga entity (`id`, `title`, `author`, etc.).
    -   [ ] Create `sourceTable`: The specific manga source (`mangaId`, `connectorId`, `sourceMangaId`, `sourceMangaUrl`).
    -   [ ] Create `chapterTable`: Chapters belonging to a specific `source` (`sourceId`, `sourceChapterId`, `url`, `publishedAt`, etc.).
    -   [ ] Create `watchlistTable`: The user's subscriptions, linking `userId` to `mangaId` (M:N relationship).
    -   [ ] Run `drizzle-kit push:pg` to sync the schema with the database.

-   [X] **Environment Variables**:
    -   [X] Set up `.env` for development.
    -   [X] Define `DATABASE_URL`.
    -   [X] Define `TELEGRAM_BOT_TOKEN`.
    -   [X] Define `NEXTAUTH_SECRET` and `NEXTAUTH_URL`.
    -   [X] Configure secrets in Vercel for production.

-   [ ] **Scraper Library Integration**:
    -   [ ] Ensure `@zweer/manga-scraper` is a dependency of the project.
    -   [ ] Create a factory or registry module in the backend to easily access instances of all available connectors (e.g., `getConnector('webtoon')`).

## Phase 1: The Core Engine (Scraping & Notifications)

This phase builds the background process that finds and registers new chapters. This is the heart of the service.

-   [ ] **Create the Cron Job API Route**:
    -   [ ] Create a new API route, e.g., `/api/cron/check-updates`.
    -   [ ] Secure this endpoint (e.g., with a secret key passed in the request) to prevent public abuse.

-   [ ] **Implement the Cron Job Logic**:
    -   [ ] Fetch all entries from the `sourceTable`.
    -   [ ] Iterate through each `source`.
    -   [ ] Use the `connectorId` to get the correct scraper connector instance.
    -   [ ] Call the connector's method to fetch the list of chapters for that `source.sourceMangaId`.
    -   [ ] Compare the fetched chapters with the ones already stored in `chapterTable` for that `source.id`.
    -   [ ] For each new chapter found:
        -   [ ] Save the new chapter details into `chapterTable`.
        -   [ ] **Trigger a notification event**: This can be a direct function call, or preferably, push a job to a queue (e.g., Vercel KV or a dedicated service like Inngest/Upstash QStash) to handle notifications asynchronously.

-   [ ] **Implement the Notification Logic**:
    -   [ ] This function/job will receive a `chapterId` or `sourceId`.
    -   [ ] Find the abstract `mangaId` from the source.
    -   [ ] Query `watchlistTable` to find all `userId`s subscribed to that `mangaId`.
    -   [ ] For each `userId`, fetch the `telegramId` from the `userTable`.
    -   [ ] Using the Grammy bot instance, send a formatted notification message to each `telegramId`. The message should include the manga title, chapter number, and a link to the chapter URL.

-   [ ] **Configure Vercel Cron Job**:
    -   [ ] Add the cron job configuration to `vercel.json` to call the `/api/cron/check-updates` endpoint on a regular schedule (e.g., every 15 minutes).

## Phase 2: Telegram Bot Interface

This phase focuses on building the user-facing bot commands.

-   [ ] **Setup Grammy Bot Handler**:
    -   [ ] Create an API route (e.g., `/api/bot`) to handle Telegram webhooks.
    -   [ ] Initialize the Grammy bot instance and set up the webhook.

-   [ ] **Implement `/start` Command**:
    -   [ ] Create a conversation flow (using `grammy/conversations` plugin).
    -   [ ] Greet the user.
    -   [ ] Ask for their email address.
    -   [ ] Implement the logic to find/create/update the user in `userTable`, linking their email and `telegramId`.
    -   [ ] Store the `userId` from your database in the bot's session (`ctx.session.userId`) for subsequent commands.

-   [ ] **Implement `/track <query>` Command**:
    -   [ ] Create an API route (e.g., `/api/manga/search`) that the bot will call.
    -   [ ] The API route should:
        -   Receive a search query.
        -   Use the connector factory to query all available connectors.
        -   Aggregate, deduplicate, and format the results.
    -   [ ] The bot calls the API, receives the list, and presents it to the user with an `InlineKeyboard` for selection.
    -   [ ] Handle the user's selection (callback query):
        -   Call another API route (e.g., `/api/manga/track`) with the selected manga details and the `userId`.
        -   This backend endpoint will create the `mangaTable` and `sourceTable` entries if they don't exist.
        -   It will then create an entry in the `watchlistTable`.
        -   Send a confirmation message back to the user.

-   [ ] **Implement `/list` Command**:
    -   [ ] Query the `watchlistTable` for the current `userId`.
    -   [ ] Join with `mangaTable` to get the titles.
    -   [ ] Format and send the list to the user.

-   [ ] **Implement `/delete` Command**:
    -   [ ] Show the user their watchlist as an `InlineKeyboard`.
    -   [ ] On selection (callback query), remove the corresponding entry from `watchlistTable`.
    -   [ ] Send a confirmation message.

## Phase 3: Future Work & Enhancements

Items to be considered after the core functionality is stable.

-   [ ] **Phase 1.5 - Email Notifications**:
    -   [ ] Integrate an email service (e.g., Resend).
    -   [ ] Extend the scraper to fetch chapter images.
    -   [ ] Create email templates (e.g., with React Email).
    -   [ ] Extend the notification logic to send emails with embedded images.

-   [ ] **Phase 1.5 - Image Persistence**:
    -   [ ] Evaluate and integrate a blob storage solution (e.g., Vercel Blob, Cloudflare R2, AWS S3).
    -   [ ] Modify the scraper/cron job to download images and upload them to your storage.
    -   [ ] Update the email/reader to use these self-hosted image URLs.

-   [ ] **Phase 2 - Web Portal**:
    -   [ ] Implement front-end authentication with `next-auth`.
    -   [ ] Build the user dashboard to manage the watchlist.
    -   [ ] Create the manga detail page.
    -   [ ] Develop the web-based chapter reader.
    -   [ ] Implement the "read progress" tracking feature (new `read_progress` table and API).
