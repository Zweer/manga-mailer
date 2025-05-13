CREATE TABLE "user-manga" (
	"userId" text NOT NULL,
	"mangaId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "user-manga_userId_mangaId_pk" PRIMARY KEY("userId","mangaId")
);
--> statement-breakpoint
ALTER TABLE "user-manga" ADD CONSTRAINT "user-manga_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user-manga" ADD CONSTRAINT "user-manga_mangaId_manga_id_fk" FOREIGN KEY ("mangaId") REFERENCES "public"."manga"("id") ON DELETE cascade ON UPDATE no action;