-- AlterTable
ALTER TABLE "tasks" ADD COLUMN "description" TEXT,
ADD COLUMN "name" VARCHAR(500) NOT NULL DEFAULT 'Untitled Task';

-- Remove default after backfill (optional — keeps schema clean)
ALTER TABLE "tasks" ALTER COLUMN "name" DROP DEFAULT;
