CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "showtimes"
ADD CONSTRAINT "showtimes_room_time_no_overlap"
EXCLUDE USING gist (
  "roomId" WITH =,
  tsrange("startTime", "endTime", '[)') WITH &&
)
WHERE ("status" <> 'CANCELLED');
