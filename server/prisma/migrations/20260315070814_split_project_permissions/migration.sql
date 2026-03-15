/*
  Warnings:

  - The primary key for the `member_roles_permissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `permission_id` on the `member_roles_permissions` table. All the data in the column will be lost.
  - The primary key for the `members_permissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `permission_id` on the `members_permissions` table. All the data in the column will be lost.
  - Added the required column `project_permission_id` to the `member_roles_permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project_permission_id` to the `members_permissions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "member_roles_permissions" DROP CONSTRAINT "member_roles_permissions_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "members_permissions" DROP CONSTRAINT "members_permissions_permission_id_fkey";

-- DropIndex
DROP INDEX "member_roles_permissions_permission_id_idx";

-- DropIndex
DROP INDEX "members_permissions_permission_id_idx";

-- AlterTable
ALTER TABLE "member_roles_permissions" DROP CONSTRAINT "member_roles_permissions_pkey",
DROP COLUMN "permission_id",
ADD COLUMN     "project_permission_id" BIGINT NOT NULL,
ADD CONSTRAINT "member_roles_permissions_pkey" PRIMARY KEY ("role", "project_permission_id");

-- AlterTable
ALTER TABLE "members_permissions" DROP CONSTRAINT "members_permissions_pkey",
DROP COLUMN "permission_id",
ADD COLUMN     "project_permission_id" BIGINT NOT NULL,
ADD CONSTRAINT "members_permissions_pkey" PRIMARY KEY ("member_id", "project_permission_id");

-- CreateTable
CREATE TABLE "project_permissions" (
    "id" BIGSERIAL NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "project_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_permissions_key_key" ON "project_permissions"("key");

-- CreateIndex
CREATE INDEX "member_roles_permissions_project_permission_id_idx" ON "member_roles_permissions"("project_permission_id");

-- CreateIndex
CREATE INDEX "members_permissions_project_permission_id_idx" ON "members_permissions"("project_permission_id");

-- AddForeignKey
ALTER TABLE "members_permissions" ADD CONSTRAINT "members_permissions_project_permission_id_fkey" FOREIGN KEY ("project_permission_id") REFERENCES "project_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_roles_permissions" ADD CONSTRAINT "member_roles_permissions_project_permission_id_fkey" FOREIGN KEY ("project_permission_id") REFERENCES "project_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
