DROP INDEX "idx_notes_trashed_at";--> statement-breakpoint
CREATE INDEX "idx_notes_is_trashed_trashed_at" ON "notes" USING btree ("is_trashed","trashed_at");