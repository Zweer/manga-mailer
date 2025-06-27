CREATE TABLE "chapter" (
	"id" text PRIMARY KEY NOT NULL,
	"sourceName" text NOT NULL,
	"sourceId" text NOT NULL,
	"mangaId" text NOT NULL,
	"title" text,
	"index" real,
	"publishedAt" timestamp with time zone NOT NULL,
	"images" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "manga" (
	"id" text PRIMARY KEY NOT NULL,
	"sourceName" text NOT NULL,
	"sourceId" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"lastChapterIndex" real DEFAULT 0 NOT NULL,
	"totalChapters" integer DEFAULT 0 NOT NULL,
	"lastCheckedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "manga_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "watchlist" (
	"userId" text NOT NULL,
	"mangaId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "watchlist_userId_mangaId_pk" PRIMARY KEY("userId","mangaId")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "telegramId" integer;--> statement-breakpoint
ALTER TABLE "chapter" ADD CONSTRAINT "chapter_mangaId_manga_id_fk" FOREIGN KEY ("mangaId") REFERENCES "public"."manga"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_mangaId_manga_id_fk" FOREIGN KEY ("mangaId") REFERENCES "public"."manga"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_telegramId_unique" UNIQUE("telegramId");