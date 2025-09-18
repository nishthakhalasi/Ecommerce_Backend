-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profilePicture" TEXT,
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;
