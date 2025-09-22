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

  const userId = Number(req.params.id);
  const {
    name,
    phone,
    defaultShippingAddress,
    defaultBillingAddress,
    status,
    lastLogin,
  } = req.body;

  // Build the object only with fields provided by the client
  const dataToValidate = {
    ...(name && { name }),
    ...(phone && { phone }),
    ...(defaultShippingAddress
      ? { defaultShippingAddress: Number(defaultShippingAddress) }
      : {}),
    ...(defaultBillingAddress
      ? { defaultBillingAddress: Number(defaultBillingAddress) }
      : {}),
    ...(typeof status !== "undefined" ? { status } : {}),
    ...(lastLogin ? { lastLogin: new Date(lastLogin) } : {}),
    ...(req.file ? { profilePicture: `/uploads/${req.file.filename}` } : {}),
  };

  // Validate only provided fields
  const validatedData = UpdateUserSchema.parse(dataToValidate);

  // Handle default shipping & billing addresses if provided
  if (validatedData.defaultShippingAddress) {
    const shippingAddress = await prismaClient.address.findFirstOrThrow({
      where: { id: validatedData.defaultShippingAddress },
    });
    if (req.user.role !== "ADMIN" && shippingAddress.userId !== req.user.id) {
      throw new BadRequestsException(
        "Shipping address does not belong to user",
        ErrorCodes.ADDRESS_NOT_BELONG
      );
    }
  }

  if (validatedData.defaultBillingAddress) {
    const billingAddress = await prismaClient.address.findFirstOrThrow({
      where: { id: validatedData.defaultBillingAddress },
    });
    if (req.user.role !== "ADMIN" && billingAddress.userId !== req.user.id) {
      throw new BadRequestsException(
        "Billing address does not belong to user",
        ErrorCodes.ADDRESS_NOT_BELONG
      );
    }
  }

  // Update only provided fields
  const updatedUser = await prismaClient.user.update({
    where: { id: userId },
    data: validatedData,
  });

  res.json(updatedUser);
};

export const listUsers = async (req: Request, res: Response) => {
  const users = await prismaClient.user.findMany({
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
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
        errorCode: 1002,
      });
    }

    const user = await prismaClient.user.findFirst({
      where: { id },
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
        address: {
          // nested select
          select: {
            id: true,
            city: true,
            country: true,
            pincode: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found!!",
        errorCode: 1001,
        errors: null,
      });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      errorCode: 1000,
      errors: error,
    });
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
