CREATE TABLE IF NOT EXISTS "accounts" (
	"id" varchar PRIMARY KEY NOT NULL,
	"api_key" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "urls" (
	"id" serial PRIMARY KEY NOT NULL,
	"short_id" varchar NOT NULL,
	"views" integer NOT NULL,
	"redirect_url" varchar NOT NULL,
	"account_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "short_id_idx" ON "urls" ("short_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_id_idx" ON "urls" ("account_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "urls" ADD CONSTRAINT "urls_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
