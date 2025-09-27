import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../exceptions/unauthorized.ts";
import { ErrorCodes } from "../exceptions/root.ts";

const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user) {
    return next(
      new UnauthorizedException(
        "No user found in request",
        ErrorCodes.UNAUTHORIZED
      )
    );
  }

  if (user.role && user.role.toUpperCase() === "ADMIN") {
    return next();
  }

  return next(
    new UnauthorizedException("Admin access required", ErrorCodes.UNAUTHORIZED)
  );
};

export default adminMiddleware;
