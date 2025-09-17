import { Request, Response, NextFunction } from "express";
import { HttpException, ErrorCodes } from "./exceptions/root.ts";
import { InternalException } from "./exceptions/internal-exception.ts";
import { ZodError } from "zod";
import { BadRequestsException } from "./exceptions/bad-requests.ts";

export const errorHandler = (method: Function) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await method(req, res, next);
    } catch (error: any) {
      let exception: HttpException;
      if (error instanceof HttpException) {
        exception = error;
      } else {
        if (error instanceof ZodError) {
          exception = new BadRequestsException(
            "Unprocessable entity..!",
            ErrorCodes.UNPROCESSABLEENTITY
          );
        } else {
          exception = new InternalException(
            "Something went wrong",
            error,
            ErrorCodes.INTERNAL_EXCEPTION
          );
        }
      }
      next(exception);
    }
  };
};
