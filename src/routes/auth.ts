import { Router } from "express";
import { login, me, signup, validateToken } from "../controllers/auth.ts";
import { errorHandler } from "../error-handler.ts";
import authMiddleware from "../middlewares/auth.ts";
import upload from "../middlewares/upload.ts";

const authRoutes = Router();

authRoutes.post(
  "/signup",
  upload.single("profilePicture"),
  errorHandler(signup)
);
authRoutes.post("/login", errorHandler(login));

authRoutes.get("/me", [authMiddleware], errorHandler(me));

authRoutes.post("/validate", validateToken);

export default authRoutes;
