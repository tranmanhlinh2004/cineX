/*
  Warnings:

  - The primary key for the `role_permissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[roleId,permissionId]` on the table `role_permissions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON "role_permissions"("roleId", "permissionId");
