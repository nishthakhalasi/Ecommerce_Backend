-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "status" "public"."OrderEventStatus" NOT NULL DEFAULT 'PENDING';
