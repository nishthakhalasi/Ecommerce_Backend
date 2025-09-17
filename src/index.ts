import express from "express";
import type { Express } from "express";
import dotenv from "dotenv";
import rootRouter from "./routes/index.ts";
import { PrismaClient } from "@prisma/client";
import { errorMiddleware } from "./middlewares/errors.ts";

dotenv.config();
const app: Express = express();
const PORT = 3000;

app.use(express.json());
app.use("/api", rootRouter);

export const prismaClient = new PrismaClient({ log: ["query"] }).$extends({
  result: {
    address: {
      formattedAddress: {
        needs: {
          lineOne: true,
          lineTwo: true,
          city: true,
          country: true,
          pincode: true,
        },
        compute: (addr) => {
          return `${addr.lineOne},${addr.lineTwo},${addr.city},${addr.country}-${addr.pincode}`;
        },
      },
    },
  },
});

app.use(errorMiddleware);

app.listen(PORT, async () => {
  console.log(`App Working on ${PORT}!!`);
});
