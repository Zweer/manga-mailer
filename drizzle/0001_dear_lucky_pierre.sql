CREATE TYPE "public"."type" AS ENUM('Ongoing', 'Completed', 'Hiatus', 'Cancelled', 'Unknown');--> statement-breakpoint
CREATE TABLE "manga" (
	"id" text PRIMARY KEY NOT NULL,
	"sourceName" text NOT NULL,
	"sourceId" text NOT NULL,
	"slug" text,
	"title" text,
	"author" text,
	"artist" text,
	"excerpt" text,
	"image" text,
	"url" text,
	"releasedAt" timestamp,
	"status" "type",
	"genres" jsonb,
	"score" integer,
	"chaptersCount" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
