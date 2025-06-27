# Manga Tracker

A comprehensive manga/webtoon tracking platform that solves the fragmentation problem of manga distribution across multiple sources.

## Table of Contents

- [Why](#why)
- [How](#how)
- [Project Phases](#project-phases)
- [Architecture](#architecture)
- [Current Status](#current-status)

## Why

### The Problem

The manga and webtoon ecosystem is highly fragmented. While there are numerous platforms publishing manga content - some with original rights, others with authorized copies - no single platform has comprehensive coverage of all available titles. This creates several pain points for readers:

1. **Source Fragmentation**: Popular manga might be available on multiple platforms, but niche titles are often exclusive to one or two sources
2. **Update Tracking**: Readers must manually check multiple platforms to stay updated on their favorite series
3. **Reading Progress**: Most platforms don't offer cross-device reading progress synchronization
4. **Discovery**: Finding where a specific manga is available requires searching across multiple platforms

### The Solution

Manga Tracker aims to centralize manga tracking and notifications across multiple sources, providing:

- **Unified Watchlist**: Track manga from any supported source in one place
- **Real-time Notifications**: Get notified immediately when new chapters are published
- **Email Integration**: Receive chapter images via email for offline reading and archival
- **Progress Tracking**: Centralized reading progress that works across devices and sources
- **Source Agnostic**: Support for multiple manga platforms through a unified interface

## How

### Technology Stack

- **Frontend & Backend**: Next.js 15 with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js v5 (beta)
- **Bot Framework**: Grammy (Telegram Bot API)
- **Scraping**: @zweer/manga-scraper for multi-source manga data
- **Email**: Nodemailer for chapter delivery
- **Hosting**: Vercel for seamless deployment and serverless functions
- **Logging**: Pino for structured logging

### Key Technical Decisions

1. **Source-Specific Schema**: Each manga is tracked per source rather than attempting to merge duplicates across platforms
2. **Telegram-First Approach**: Starting with Telegram bot for immediate user interaction before building the full web interface
3. **Serverless Architecture**: Leveraging Vercel's serverless functions for scalability and cost-effectiveness
4. **Real-time Processing**: Cron-based chapter checking with immediate notification delivery

## Project Phases

### Phase 1: Telegram Bot & Core Engine
**Goal**: Functional notification system via Telegram

- ✅ Database schema and models
- ✅ Basic bot infrastructure
- 🔄 User registration and manga tracking commands
- 🔄 Automated chapter checking and notifications
- 📋 Email delivery with chapter images

### Phase 1.5: Enhanced Notifications
**Goal**: Rich notification experience

- 📋 Email notifications with embedded chapter images
- 📋 Notification preferences and customization
- 📋 Batch notifications and digest options

### Phase 2: Web Portal
**Goal**: Full-featured web application

- 📋 Web-based manga reader
- 📋 Reading progress tracking across devices
- 📋 Advanced search and discovery features
- 📋 User dashboard and analytics
- 📋 Social features (reviews, ratings, recommendations)

## Architecture

### Database Design

The system uses a source-specific approach where each manga is tracked individually per platform:

- **Users**: Support both web authentication and Telegram integration
- **Manga**: Source-specific entries with denormalized metadata for performance
- **Chapters**: Individual chapter tracking with publication timestamps
- **Watchlist**: Many-to-many relationship between users and manga
- **Progress Tracking**: Reading state management (planned for Phase 2)

### Notification Pipeline

1. **Scheduled Checking**: Cron jobs query all tracked manga for updates
2. **Change Detection**: Compare latest chapters against stored state
3. **Notification Dispatch**: Send immediate notifications via Telegram
4. **Email Processing**: Generate and send chapter emails with images
5. **State Update**: Update manga metadata and chapter records

### Scalability Considerations

- **Connector Pooling**: Reuse scraper instances to minimize initialization overhead
- **Rate Limiting**: Respect source platform limits to avoid blocking
- **Caching Strategy**: Cache manga metadata to reduce redundant scraping
- **Queue System**: Decouple notification sending from chapter detection

## Current Status

**Phase 1 - In Progress**

- ✅ Project setup and database schema
- ✅ Basic Telegram bot infrastructure
- 🔄 Core bot commands implementation
- 🔄 Chapter checking automation
- 📋 Email notification system

The project is currently in active development with the core tracking and notification system being built out.

---

*Legend: ✅ Complete | 🔄 In Progress | 📋 Planned*
