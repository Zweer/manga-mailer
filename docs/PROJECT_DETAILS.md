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
