import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../index.ts";
import { hashSync, compareSync } from "bcrypt";
import jwt from "jsonwebtoken";
import { BadRequestsException } from "../exceptions/bad-requests.ts";
import { ErrorCodes } from "../exceptions/root.ts";
import { SignUpSchema } from "../schema/users.ts";
import { NotFoundException } from "../exceptions/not-found.ts";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET as string;

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  SignUpSchema.parse(req.body);
  const { email, password, name, phone } = req.body;
  // Save uploaded file path if file exists
  const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;

  let user = await prismaClient.user.findFirst({ where: { email } });

  if (user) {
    throw new BadRequestsException(
      "User already exists!",
      ErrorCodes.USER_ALREADY_EXISTS
    );
  }

  user = await prismaClient.user.create({
    data: {
      name,
      email,
      password: hashSync(password, 10),
      phone,
      profilePicture,
    },
  });
  res.json(user);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  let user = await prismaClient.user.findFirst({ where: { email } });

  if (!user) {
    throw new NotFoundException("User not found!", ErrorCodes.USER_NOT_FOUND);
  }

  if (!compareSync(password, user.password)) {
    throw new BadRequestsException(
      "Incorrect password!",
      ErrorCodes.INCORRECT_PASSWORD
    );
  }
  await prismaClient.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });
  const token = jwt.sign(
    {
      userId: user.id,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.json({ user, token });
};

// /me -> return the logged in user

export const me = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const { password, ...userData } = req.user;
  res.json(userData);
};
