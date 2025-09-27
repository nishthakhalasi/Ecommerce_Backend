import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../exceptions/unauthorized.ts";
import { ErrorCodes } from "../exceptions/root.ts";
import jwt from "jsonwebtoken";
import { prismaClient } from "../index.ts";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET as string;

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(
      new UnauthorizedException("Unauthorized", ErrorCodes.UNAUTHORIZED)
    );
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  if (!token) {
    return next(new UnauthorizedException("No token", ErrorCodes.UNAUTHORIZED));
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    console.log("Token verified:", payload);

    // const user = await prismaClient.user.findFirst({
    //   where: { id: payload.userId, status: true },
    // });

    const user = await prismaClient.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      console.log("No active user found for:", payload.userId);
      return next(
        new UnauthorizedException("Unauthorized", ErrorCodes.UNAUTHORIZED)
      );
    }

    req.user = user;
    console.log("User attached:", user.id);
    next();
  } catch (error) {
    console.error(" JWT verify failed:", error);
    next(new UnauthorizedException("Unauthorized", ErrorCodes.UNAUTHORIZED));
  }
};

export default authMiddleware;
