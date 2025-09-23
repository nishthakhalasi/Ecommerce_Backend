import { Router } from "express";
import { errorHandler } from "../error-handler";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProduct,
  updateProduct,
} from "../controllers/products";
import authMiddleware from "../middlewares/auth";
import adminMiddleware from "../middlewares/admin";
import upload from "../middlewares/upload";

const productRouter = Router();

productRouter.post(
  "/",
  [authMiddleware, adminMiddleware],
  upload.single("photo"),
  errorHandler(createProduct)
);
productRouter.put(
  "/:id",
  [authMiddleware, adminMiddleware],
  upload.single("photo"),
  errorHandler(updateProduct)
);
productRouter.delete(
  "/:id",
  [authMiddleware, adminMiddleware],
  errorHandler(deleteProduct)
);

productRouter.get(
  "/",
  // [authMiddleware, adminMiddleware],
  errorHandler(listProduct)
);

productRouter.get(
  "/:id",
  [authMiddleware, adminMiddleware],
  errorHandler(getProductById)
);

export default productRouter;
