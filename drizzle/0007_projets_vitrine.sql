ALTER TABLE "projects" ADD COLUMN "kind" text DEFAULT 'personal' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "context" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "contribution" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "award" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "facts" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "image_mobile_url" text;