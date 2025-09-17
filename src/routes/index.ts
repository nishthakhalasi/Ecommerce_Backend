import { Router } from "express";
import authRoutes from "./auth.ts";
import productRouter from "./products.ts";
import usersRoutes from "./users.ts";
import cartRoutes from "./cart.ts";
import orderRoutes from "./orders.ts";

const rootRouter = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/products", productRouter);
rootRouter.use("/users", usersRoutes);
rootRouter.use("/carts", cartRoutes);
rootRouter.use("/orders", orderRoutes);

export default rootRouter;

/*1. user management
    a. list users
    c. get user by id
    b. change user role
  2. order management
    a. list all orders(filter on status)
    b. change order status
    c. list all orders of given users
  3. products
    a. search api for products (for both users and admins) -> full text search
*/
