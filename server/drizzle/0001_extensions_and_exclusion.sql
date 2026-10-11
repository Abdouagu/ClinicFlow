CREATE EXTENSION IF NOT EXISTS btree_gist;--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_patients_full_name_trgm" ON "patients" USING gin ("full_name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_patients_cin_trgm" ON "patients" USING gin ("cin" gin_trgm_ops);--> statement-breakpoint
ALTER TABLE "appointments"
ADD CONSTRAINT "no_overlapping_confirmed_appointments"
EXCLUDE USING gist (
  "patient_id" WITH =,
  tsrange(
    ("appointment_date" AT TIME ZONE 'UTC'),
    ("appointment_date" AT TIME ZONE 'UTC') + interval '30 minutes'
  ) WITH &&
) WHERE ("status" = 'confirmed');