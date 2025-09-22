import { Router } from "express";
import authMiddleware from "../middlewares/auth";
import { errorHandler } from "../error-handler";
import {
  addAddress,
  changeUserRole,
  deleteAddress,
  deleteUser,
  getUserById,
  listAddress,
  listUsers,
  updateUser,
} from "../controllers/users";
import adminMiddleware from "../middlewares/admin";
import upload from "../middlewares/upload.ts";

const usersRoutes = Router();

usersRoutes.post("/address", [authMiddleware], errorHandler(addAddress));

usersRoutes.delete(
  "/address/:id",
  [authMiddleware],
  errorHandler(deleteAddress)
);

usersRoutes.get("/address", [authMiddleware], errorHandler(listAddress));

usersRoutes.put(
  "/:id/update",
  [authMiddleware, adminMiddleware],
  upload.single("profilePicture"),
  errorHandler(updateUser)
);

usersRoutes.put(
  "/:id/role",
  [authMiddleware, adminMiddleware],
  errorHandler(changeUserRole)
);
usersRoutes.get(
  "/",
  [authMiddleware, adminMiddleware],
  errorHandler(listUsers)
);
usersRoutes.get(
  "/:id",
  [authMiddleware, adminMiddleware],
  errorHandler(getUserById)
);

usersRoutes.delete(
  "/:id",
  [authMiddleware, adminMiddleware],
  errorHandler(deleteUser)
);

export default usersRoutes;
