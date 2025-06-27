# Manga Tracker - Development TODO

Development tasks organized by project phases as outlined in the main README.

## Phase 0: Foundation ✅

-   [X] **Project Setup**: Next.js, Vercel, dependencies
-   [X] **Database Schema**: Complete schema with relations
-   [X] **Environment Configuration**: Development and production setup
-   [X] **Basic Bot Infrastructure**: Grammy setup and webhook handler

## Phase 1: Telegram Bot & Core Engine 🔄

### Bot Commands
-   [ ] **Scraper Factory**: Create connector registry for manga sources
-   [ ] **User Registration**: `/start` command with email linking
-   [ ] **Manga Search**: `/track <query>` with source selection
-   [ ] **Watchlist Management**: `/list` and `/delete` commands
-   [ ] **Help System**: `/help` command with usage instructions

### Chapter Checking System
-   [ ] **Cron API Route**: `/api/cron/check-updates` with security
-   [ ] **Update Detection**: Compare fetched chapters with stored state
-   [ ] **Database Updates**: Save new chapters and update manga metadata
-   [ ] **Notification Pipeline**: Queue and dispatch notifications
-   [ ] **Vercel Cron**: Configure scheduled execution

## Phase 1.5: Enhanced Notifications 📋

-   [ ] **Email Integration**: Nodemailer setup and templates
-   [ ] **Chapter Images**: Scrape and embed images in emails
-   [ ] **Notification Preferences**: User customization options
-   [ ] **Batch Notifications**: Digest mode for multiple updates

## Phase 2: Web Portal 📋

-   [ ] **Authentication**: NextAuth.js integration and user dashboard
-   [ ] **Web Reader**: Chapter viewing interface
-   [ ] **Progress Tracking**: Cross-device reading state synchronization
-   [ ] **Advanced Search**: Multi-source discovery with filters
-   [ ] **Social Features**: Reviews, ratings, recommendations

## Future Enhancements 📋

-   [ ] **Image Storage**: Blob storage for chapter image persistence
-   [ ] **Mobile App**: React Native or PWA implementation
-   [ ] **API**: Public API for third-party integrations
-   [ ] **Analytics**: Reading statistics and insights
