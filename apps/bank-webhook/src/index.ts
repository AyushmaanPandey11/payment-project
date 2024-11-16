import express from "express";
import db from "@repo/db/client";
import zod from "zod";
import { ApiError } from "../../../utils/ApiError";
import { ApiResponse } from "../../../utils/ApiResponse";
const app = express();

app.use(express.json());

const paymentBody = zod.object({
  token: zod.string(),
  userId: zod.string(),
  amount: zod.number(),
});

app.post("/hdfcWebhook", async (req, res) => {
  const body = req.body;
  const { success, data } = paymentBody.safeParse(body);
  if (!success) {
    throw new ApiError(411, "UnAuthorized Accesss");
  }
  const onRampData = await db.onRampTransaction.findUnique({
    where: {
      token: data.token,
    },
  });
  if (onRampData?.status === "Success") {
    throw new ApiError(400, "Transaction already completed");
  }
  try {
    await db.$transaction([
      db.balance.updateMany({
        where: {
          userId: Number(data.userId),
        },
        data: {
          amount: {
            // You can also get this from your DB
            increment: Number(data.amount),
          },
        },
      }),
      db.onRampTransaction.updateMany({
        where: {
          token: data.token,
        },
        data: {
          status: "Success",
        },
      }),
    ]);
    res.status(200).json(new ApiResponse(200, data, "transaction processed"));
  } catch (e) {
    console.error(e);
    throw new ApiError(411, "error processing payment");
  }
});

app.listen(3003, `BankWebHoook Service running on ${3000}`);
