import express from "express";
import db from "@repo/db/client";
import zod from "zod";
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
    return res.status(411).json({
      message: "invalid data format",
    });
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

    res.json({
      message: "Captured",
    });
  } catch (e) {
    console.error(e);
    res.status(411).json({
      message: "Error while processing webhook",
    });
  }
});

app.listen(3003, `BankWebHoook Service running on ${3000}`);
