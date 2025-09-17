import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { HttpException } from "../exceptions/root.ts";

export const errorMiddleware: ErrorRequestHandler = (
  error: HttpException,
  req,
  res,
  next
) => {
  res.status(error.statusCode || 500).json({
    message: error.message,
    errorCode: error.errorCode,
    errors: error.errors,
  });
};
