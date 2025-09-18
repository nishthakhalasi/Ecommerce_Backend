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
  // 1. extract the token from header
  const token = req.headers.authorization;
  // 2. if the token is not present, throw an error of unauthorized
  if (!token) {
    return next(
      new UnauthorizedException("Unauthorized", ErrorCodes.UNAUTHORIZED)
    );
  }

  try {
    // 3. if the token is present,verify that token and extract the payload
    const payload = jwt.verify(token, JWT_SECRET) as any;
    // 4. to get the user from payload
    const user = await prismaClient.user.findFirst({
      where: { id: payload.userId, status: true },
    });
    if (!user) {
      return next(
        new UnauthorizedException("Unauthorized", ErrorCodes.UNAUTHORIZED)
      );
    }
    // 5. to attach the user to the current request object
    req.user = user;
    next();
  } catch (error) {
    next(new UnauthorizedException("Unauthorized", ErrorCodes.UNAUTHORIZED));
  }
};

export default authMiddleware;
