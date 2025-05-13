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
