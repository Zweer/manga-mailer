CREATE TABLE "chapter" (
	"id" text PRIMARY KEY NOT NULL,
	"sourceName" text NOT NULL,
	"sourceId" text NOT NULL,
	"mangaId" text NOT NULL,
	"title" text,
	"index" real,
	"url" text,
	"releasedAt" timestamp,
	"images" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "telegramId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "manga" ADD COLUMN "lastCheckedAt" timestamp;--> statement-breakpoint
ALTER TABLE "chapter" ADD CONSTRAINT "chapter_mangaId_manga_id_fk" FOREIGN KEY ("mangaId") REFERENCES "public"."manga"("id") ON DELETE cascade ON UPDATE no action;