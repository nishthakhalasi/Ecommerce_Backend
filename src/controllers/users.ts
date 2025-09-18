import { Request, Response } from "express";
import { AddressSchema, UpdateUserSchema } from "../schema/users";
import { prismaClient } from "..";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCodes } from "../exceptions/root";
import { Address } from "@prisma/client";
import { BadRequestsException } from "../exceptions/bad-requests";
import { UnauthorizedException } from "../exceptions/unauthorized";

export const addAddress = async (req: Request, res: Response) => {
  AddressSchema.parse(req.body);

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const address = await prismaClient.address.create({
    data: {
      ...req.body,
      userId: req.user.id,
    },
  });

  res.json(address);
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    await prismaClient.address.delete({
      where: { id: +req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    throw new NotFoundException(
      "Address not found!!",
      ErrorCodes.ADDRESS_NOT_FOUND
    );
  }
};

export const listAddress = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedException("Unauthorized", ErrorCodes.UNAUTHORIZED);
  }

  const address = await prismaClient.address.findMany({
    where: { userId: req.user.id },
  });
  res.json(address);
};

export const updateUser = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedException("Unauthorized", ErrorCodes.UNAUTHORIZED);
  }
  const validatedData = UpdateUserSchema.parse(req.body);
  // Handle uploaded profile picture
  if (req.file) {
    validatedData.profilePicture = `/uploads/${req.file.filename}`;
  }
  let shippingAddress: Address;
  let billingAddress: Address;
  if (validatedData.defaultShippingAddress) {
    try {
      shippingAddress = await prismaClient.address.findFirstOrThrow({
        where: {
          id: validatedData.defaultShippingAddress,
        },
      });
    } catch (error) {
      throw new NotFoundException(
        "address not found",
        ErrorCodes.ADDRESS_NOT_FOUND
      );
    }
    if (shippingAddress.userId != req.user.id) {
      throw new BadRequestsException(
        "address does not belong to user",
        ErrorCodes.ADDRESS_NOT_BELONG
      );
    }
  }
  if (validatedData.defaultBillingAddress) {
    try {
      billingAddress = await prismaClient.address.findFirstOrThrow({
        where: {
          id: validatedData.defaultBillingAddress,
        },
      });
    } catch (error) {
      throw new NotFoundException(
        "address not found",
        ErrorCodes.ADDRESS_NOT_FOUND
      );
    }
    if (billingAddress.userId != req.user.id) {
      throw new BadRequestsException(
        "address does not belong to user",
        ErrorCodes.ADDRESS_NOT_BELONG
      );
    }
  }
  const updateUser = await prismaClient.user.update({
    where: {
      id: req.user.id,
    },
    data: validatedData,
  });
  res.json(updateUser);
};

export const listUsers = async (req: Request, res: Response) => {
  const users = await prismaClient.user.findMany({
    skip: +Number(req.query.skip) || 0,
    take: 5,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      profilePicture: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      defaultShippingAddress: true,
      defaultBillingAddress: true,
    },
  });
  res.json(users);
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await prismaClient.user.findFirstOrThrow({
      where: { id: +req.params.id },
      include: { address: true },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profilePicture: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        defaultShippingAddress: true,
        defaultBillingAddress: true,
        address: true,
      },
    });
    res.json(user);
  } catch (error) {
    throw new NotFoundException("User not found!!", ErrorCodes.USER_NOT_FOUND);
  }
};

export const changeUserRole = async (req: Request, res: Response) => {
  //validation
  try {
    const user = await prismaClient.user.update({
      where: { id: +req.params.id },
      data: {
        role: req.body.role,
        status: req.body.status,
      },
    });
    res.json(user);
  } catch (error) {
    throw new NotFoundException("User not found!!", ErrorCodes.USER_NOT_FOUND);
  }
};
