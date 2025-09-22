import { Request, Response } from "express";
import { prismaClient } from "../index";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCodes } from "../exceptions/root";
import { date } from "zod";

export const createProduct = async (req: Request, res: Response) => {
  const { name, description, price, tags } = req.body;

  const tagsArray =
    typeof tags === "string" ? tags.split(",").map((t) => t.trim()) : tags;

  const product = await prismaClient.product.create({
    data: {
      name,
      description,
      price: parseFloat(price),
      tags: tagsArray,
      photo: req.file?.filename || null,
    },
  });

  res.json(product);
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, tags } = req.body;
    const data: any = { name, description, price };

    if (tags) {
      data.tags = Array.isArray(tags)
        ? tags
        : tags.split(",").map((t: string) => t.trim());
    }

    if (req.file) {
      data.photo = req.file.filename;
    }

    const updateProduct = await prismaClient.product.update({
      where: { id: Number(req.params.id) },
      data,
    });

    res.json(updateProduct);
  } catch (error) {
    console.error(error);
    throw new NotFoundException(
      "Product not found",
      ErrorCodes.PRODUCT_NOT_FOUND
    );
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const deletedProduct = await prismaClient.product.delete({
      where: {
        id: +req.params.id,
      },
    });

    res.json({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    throw new NotFoundException(
      "Product not found",
      ErrorCodes.PRODUCT_NOT_FOUND
    );
  }
};

export const listProduct = async (req: Request, res: Response) => {
  const count = await prismaClient.product.count();
  const products = await prismaClient.product.findMany({
    skip: +Number(req.query.skip) || 0,
    take: 5,
  });
  res.json({ count, date: products });
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await prismaClient.product.findFirstOrThrow({
      where: {
        id: +req.params.id,
      },
    });
    res.json(product);
  } catch (error) {
    throw new NotFoundException(
      "Product not found",
      ErrorCodes.PRODUCT_NOT_FOUND
    );
  }
};
