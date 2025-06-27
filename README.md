# Manga Mailer

A Next.js-based manga notification system that tracks manga updates and sends notifications via Telegram bot. Users can subscribe to their favorite manga series and receive instant notifications when new chapters are released.

## What's Inside

### Core Components

**Telegram Bot (`lib/bot/`)**
- Grammy-based bot with conversation support
- Webhook handler at `/api/bot/route.ts`
- Message routing and command processing
- Session management for user interactions

**Database Layer (`lib/db/`)**
- Drizzle ORM with PostgreSQL
- Four main entities: Users, Manga, Chapters, Watchlist
- Relational schema with proper foreign keys and indexes
- Migration system in `drizzle/` directory

**API Routes (`app/api/`)**
- RESTful endpoints for manga operations
- Telegram webhook integration
- Planned cron job endpoints for chapter checking

### Architecture

**Data Flow**
1. Cron jobs scrape manga sources for new chapters
2. New chapters trigger notifications to subscribed users
3. Users interact via Telegram bot to manage subscriptions
4. All data persisted in PostgreSQL with proper relationships

**Key Files**
- `lib/bot/index.ts` - Bot initialization and message handling
- `lib/db/model/manga.ts` - Database schema definitions
- `app/api/bot/route.ts` - Telegram webhook endpoint
- `drizzle.config.ts` - Database configuration

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Bot Framework**: Grammy (Telegram Bot API)
- **Authentication**: NextAuth.js v5 (beta)
- **Manga Scraping**: @zweer/manga-scraper
- **Logging**: Pino with structured logging
- **Deployment**: Vercel with automatic releases

## Project Structure

```
├── app/
│   ├── api/bot/          # Telegram webhook handler
│   └── route.ts          # Main API route
├── lib/
│   ├── bot/              # Bot logic and types
│   ├── db/model/         # Database schema (users, manga, chapters)
│   └── logger.ts         # Structured logging setup
├── drizzle/              # Database migrations and snapshots
└── doc/TODO.md           # Development roadmap
```

## Database Schema

**Core Entities**
- `userTable` - User accounts with Telegram ID linking
- `mangaTable` - Canonical manga with source information
- `chapterTable` - Individual chapters with metadata
- `watchlistTable` - User subscriptions (many-to-many)

**Key Features**
- Unique constraints on source identifiers
- Cascade deletes for data integrity
- Indexed fields for performance
- JSON storage for chapter images

## Development Status

**Completed (Phase 0)**
- ✅ Next.js project setup with Vercel deployment
- ✅ Database schema with Drizzle ORM
- ✅ Basic Telegram bot structure
- ✅ Environment configuration

**In Progress (Phase 1)**
- 🚧 Cron job system for chapter checking
- 🚧 Notification logic implementation
- 🚧 Multi-source manga scraping

**Planned (Phase 2+)**
- 📋 Complete bot command interface
- 📋 User registration flow
- 🔮 Web portal for manga management
- 🔮 Email notifications with images

See [TODO.md](doc/TODO.md) for detailed roadmap.

## Available Scripts

- `npm run dev` - Development server with Turbopack
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Apply database changes
- `npm run lint` - ESLint with custom configuration
