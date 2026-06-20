ALTER TABLE "tickets" ALTER COLUMN "status" DROP DEFAULT;

CREATE TYPE "TicketStatus_new" AS ENUM ('VALID', 'INVALID');

ALTER TABLE "tickets"
ALTER COLUMN "status" TYPE "TicketStatus_new"
USING (
  CASE
    WHEN "status"::text = 'CANCELLED' THEN 'INVALID'
    ELSE 'VALID'
  END
)::"TicketStatus_new";

DROP TYPE "TicketStatus";
ALTER TYPE "TicketStatus_new" RENAME TO "TicketStatus";

ALTER TABLE "tickets" ALTER COLUMN "status" SET DEFAULT 'VALID';
