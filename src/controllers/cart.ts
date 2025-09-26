import { Request, Response } from "express";
import { ChangeQuantitySchema, CreateCartSchema } from "../schema/cart";
import { Product } from "@prisma/client";
import { prismaClient } from "..";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCodes } from "../exceptions/root";
import { UnauthorizedException } from "../exceptions/unauthorized";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil",
});

export const addItemToCart = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedException("Unauthorized", ErrorCodes.UNAUTHORIZED);
  }
  const validatedData = CreateCartSchema.parse(req.body);
  let product: Product;
  try {
    product = await prismaClient.product.findFirstOrThrow({
      where: { id: validatedData.productId },
    });
  } catch (error) {
    throw new NotFoundException(
      "Product not found!!",
      ErrorCodes.PRODUCT_NOT_FOUND
    );
  }
  const cart = await prismaClient.cartItem.create({
    data: {
      userId: req.user?.id,
      productId: product.id,
      quantity: validatedData.quantity,
    },
  });
  res.json(cart);
};

export const deleteItemToCart = async (req: Request, res: Response) => {
  try {
    const cartItemId = +req.params.id;
    const deletedItem = await prismaClient.cartItem.delete({
      where: { id: cartItemId },
    });

    res.json({ success: true, id: deletedItem.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const changeQuantity = async (req: Request, res: Response) => {
  const validatedData = ChangeQuantitySchema.parse(req.body);
  const updatedCart = await prismaClient.cartItem.update({
    where: {
      id: +req.params.id,
    },
    data: {
      quantity: validatedData.quantity,
    },
  });
  res.json(updatedCart);
};

export const getCart = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedException("Unauthorized", ErrorCodes.UNAUTHORIZED);
  }
  try {
    const cart = await prismaClient.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
    });
    res.json(cart);
  } catch (error) {
    console.log("error", error);
  }
};

export const checkoutCart = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedException("Unauthorized", ErrorCodes.UNAUTHORIZED);
  }
  try {
    const cartItems = await prismaClient.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
    });
    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    const amount = cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: {
        userId: req.user.id,
        cartItems: JSON.stringify(
          cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          }))
        ),
      },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Failed to create payment" });
  }
};
