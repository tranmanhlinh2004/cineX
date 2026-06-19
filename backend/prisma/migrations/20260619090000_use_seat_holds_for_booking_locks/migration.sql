DROP INDEX IF EXISTS "booking_details_showtimeId_seatId_key";

INSERT INTO "seat_holds" (
  "userId",
  "showtimeId",
  "seatId",
  "holdCode",
  "status",
  "expiresAt",
  "createdAt",
  "updatedAt"
)
SELECT
  b."userId",
  bd."showtimeId",
  bd."seatId",
  'HOLD-' || b."bookingCode" || '-' || bd."id",
  CASE
    WHEN b."status" = 'CONFIRMED' THEN 'BOOKED'::"HoldStatus"
    ELSE 'HOLDING'::"HoldStatus"
  END,
  CASE
    WHEN b."status" = 'CONFIRMED' THEN s."endTime"
    ELSE COALESCE(p."createdAt", b."createdAt") + interval '5 minutes'
  END,
  NOW(),
  NOW()
FROM "booking_details" bd
JOIN "bookings" b ON b."id" = bd."bookingId"
JOIN "showtimes" s ON s."id" = bd."showtimeId"
LEFT JOIN LATERAL (
  SELECT "createdAt"
  FROM "payments"
  WHERE "bookingId" = b."id"
  ORDER BY "createdAt" DESC
  LIMIT 1
) p ON TRUE
WHERE b."status" IN ('PENDING', 'CONFIRMED')
ON CONFLICT ("showtimeId", "seatId") DO UPDATE
SET
  "userId" = EXCLUDED."userId",
  "holdCode" = EXCLUDED."holdCode",
  "status" = EXCLUDED."status",
  "expiresAt" = EXCLUDED."expiresAt",
  "updatedAt" = NOW();
