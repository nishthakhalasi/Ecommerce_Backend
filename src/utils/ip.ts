import { Request } from "express";

export const getClientIp = (req: Request) => {
  const forwarded = req.headers["x-forwarded-for"] as string;
  return forwarded ? forwarded.split(",")[0].trim() : req.socket.remoteAddress;
};
