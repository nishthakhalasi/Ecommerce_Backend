import { z } from "zod";

export const SignUpSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  profilePicture: z.string().url().optional(),
});

export const AddressSchema = z.object({
  lineOne: z.string(),
  lineTwo: z.string().nullable(),
  pincode: z.string().length(6),
  country: z.string(),
  city: z.string(),
});

export const UpdateUserSchema = z.object({
  name: z.string().optional(),
  defaultShippingAddress: z.number().optional(),
  defaultBillingAddress: z.number().optional(),
  phone: z.string().optional(),
  profilePicture: z.string().url().optional(),
  status: z.boolean().optional(),
  lastLogin: z.date().optional(),
});
