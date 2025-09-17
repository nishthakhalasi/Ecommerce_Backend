import { Request, Response } from "express";
import { prismaClient } from "..";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { ErrorCodes } from "../exceptions/root";
import { NotFoundException } from "../exceptions/not-found";

export const createOrder = async (req: Request, res: Response) => {
  //1. to create a transaction
  //2. to list all the cart items and proceed if cart is not empty
  //3. calculate the total amount
  //4. fetch address of user
  //5. to define computed field for formatted address on address module
  //6. we eill create a order and order productsorder products
  //7. create event

  if (!req.user) {
    throw new UnauthorizedException("Unauthorized", ErrorCodes.UNAUTHORIZED);
  }
  return await prismaClient.$transaction(async (tx) => {
    const cartItems = await tx.cartItem.findMany({
      where: { userId: req.user!.id },
      include: { product: true },
    });

    if (cartItems.length == 0) {
      return res.json({ message: "cart is empty" });
    }

    const price = cartItems.reduce((prev, current) => {
      return prev + current.quantity * Number(current.product.price);
    }, 0);

    const address = await tx.address.findFirst({
      where: { id: req.user!.defaultShippingAddress! },
    });

    const order = await tx.order.create({
      data: {
        user: {
          connect: { id: req.user?.id },
        },
        netAmount: price,
        address: address!.formattedAddress,
        products: {
          create: cartItems.map((cart) => {
            return { productId: cart.productId, quantity: cart.quantity };
          }),
        },
      },
    });
    const orderEvent = await tx.orderEvent.create({
      data: { orderId: order.id },
    });
    await tx.cartItem.deleteMany({
      where: { userId: req.user!.id },
    });
    return res.json(order);
  });
};

export const listOrders = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const orders = await prismaClient.order.findMany({
    where: { userId: req.user.id },
  });
  res.json(orders);
};

export const cancelOrder = async (req: Request, res: Response) => {
  //1. wrap it inside transaction
  //2. check if the user is cancelling its own order

  try {
    const order = await prismaClient.order.update({
      where: { id: +req.params.id },
      data: {
        status: "CANCELLED",
      },
    });
    await prismaClient.orderEvent.create({
      data: { orderId: order.id, status: "CANCELLED" },
    });
    res.json(order);
  } catch (error) {
    throw new NotFoundException(
      "Order not found!!",
      ErrorCodes.ORDER_NOT_FOUND
    );
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await prismaClient.order.findFirstOrThrow({
      where: { id: +req.params.id },
      include: { products: true, events: true },
    });
    res.json(order);
  } catch (error) {
    throw new NotFoundException(
      "Order not found!!",
      ErrorCodes.ORDER_NOT_FOUND
    );
  }
};

export const listAllOrders = async (req: Request, res: Response) => {
  let whereClause = {};
  const status = req.query.status;
  if (status) {
    whereClause = {
      status,
    };
  }
  const orders = await prismaClient.order.findMany({
    where: whereClause,
    skip: +Number(req.query.skip) || 0,
    take: 5,
  });
  res.json(orders);
};

export const changeStatus = async (req: Request, res: Response) => {
  //wrap it inside transaction
  try {
    const order = await prismaClient.order.update({
      where: { id: +req.params.id },
      data: {
        status: req.body.status,
      },
    });
    // await prismaClient.orderEvent.create({
    //   data: { orderId: order.id, status: req.body.status },
    // });
    res.json(order);
  } catch (error) {
    throw new NotFoundException(
      "Order not found!!",
      ErrorCodes.ORDER_NOT_FOUND
    );
  }
};

export const listUserOrders = async (req: Request, res: Response) => {
  let whereClause: any = { userId: +req.params.id };
  const status = req.params.status;
  if (status) {
    whereClause = {
      ...whereClause,
      status,
    };
  }
  const orders = await prismaClient.order.findMany({
    where: whereClause,
    skip: +Number(req.query.skip) || 0,
    take: 5,
  });
  res.json(orders);
};
