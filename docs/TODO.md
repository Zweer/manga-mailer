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
