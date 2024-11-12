import express from "express";
import zod from "zod";
import db from "@repo/db/client";
const app = express();
app.use(express.json());
const paymentBody = zod.object({
  token: zod.string(),
  userId: zod.string(),
  amount: zod.number(),
});

app.post("/hdfcWebhook", (req, res) => {
  (async () => {
    const body = req.body;
    const { success, data } = paymentBody.safeParse(body);

    if (!success) {
      return res.status(411).json({
        message: "Invalid Input",
      });
    }

    const paymentDetail = data;
    try {
      await db.$transaction([
        db.balance.update({
          where: {
            userId: Number(paymentDetail.userId),
          },
          data: {
            amount: {
              increment: Number(paymentDetail.amount),
            },
          },
        }),
        db.onRampTransaction.update({
          where: {
            token: paymentDetail.token,
          },
          data: {
            status: "Success",
          },
        }),
      ]);

      res.status(200).json({
        message: "Money Received successfully",
        paymentDetail,
      });
    } catch (error) {
      console.error(error);
      res.status(411).json({
        message: "Transaction Failed to Store",
      });
    }
  })().catch((err) => {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  });
});

app.listen(3003, () => {
  console.log("Bank WebHookServer running on port 3000");
});
