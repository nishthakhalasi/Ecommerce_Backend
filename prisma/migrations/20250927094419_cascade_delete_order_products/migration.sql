-- DropForeignKey
ALTER TABLE "public"."order_products" DROP CONSTRAINT "order_products_productId_fkey";

-- AddForeignKey
ALTER TABLE "public"."order_products" ADD CONSTRAINT "order_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
