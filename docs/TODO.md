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
