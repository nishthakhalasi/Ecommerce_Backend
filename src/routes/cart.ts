import { Router } from "express";
import authMiddleware from "../middlewares/auth";
import { errorHandler } from "../error-handler";
import {
  addItemToCart,
  changeQuantity,
  checkoutCart,
  deleteItemToCart,
  getCart,
} from "../controllers/cart";

const cartRoutes = Router();

cartRoutes.post("/", [authMiddleware], errorHandler(addItemToCart));
cartRoutes.get("/", [authMiddleware], errorHandler(getCart));
cartRoutes.delete("/:id", [authMiddleware], errorHandler(deleteItemToCart));
cartRoutes.put("/:id", [authMiddleware], errorHandler(changeQuantity));
cartRoutes.post("/checkout", [authMiddleware], errorHandler(checkoutCart));

export default cartRoutes;
