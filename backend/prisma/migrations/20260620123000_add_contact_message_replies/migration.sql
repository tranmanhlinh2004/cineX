-- CreateTable
CREATE TABLE "contact_message_replies" (
    "id" SERIAL NOT NULL,
    "contactMessageId" INTEGER NOT NULL,
    "adminUserId" INTEGER,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_message_replies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_message_replies_contactMessageId_createdAt_idx" ON "contact_message_replies"("contactMessageId", "createdAt");

-- CreateIndex
CREATE INDEX "contact_message_replies_adminUserId_idx" ON "contact_message_replies"("adminUserId");

-- AddForeignKey
ALTER TABLE "contact_message_replies" ADD CONSTRAINT "contact_message_replies_contactMessageId_fkey" FOREIGN KEY ("contactMessageId") REFERENCES "contact_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_message_replies" ADD CONSTRAINT "contact_message_replies_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
