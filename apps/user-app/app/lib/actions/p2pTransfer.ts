"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";
import { ApiError } from "next/dist/server/api-utils";

const p2pTransfer = async (to: string, amount: number) => {
  const session = await getServerSession(authOptions);
  const from = session?.user?.id;
  if (!from) {
    throw new ApiError(400, "Unauthorized Access");
  }
  const recipient = await prisma.user.findFirst({
    where: {
      number: to,
    },
  });
  if (!recipient) {
    throw new ApiError(400, "Recipient doesn't exists");
  }
  await prisma.$transaction(async (tx) => {
    const senderBal = await tx.balance.findUnique({
      where: {
        userId: Number(from),
      },
    });
    if (!senderBal || senderBal.amount < amount) {
      throw new ApiError(404, "Insufficient fund");
    }
    await tx.balance.update({
      where: {
        userId: Number(from),
      },
      data: {
        amount: {
          decrement: amount * 100,
        },
      },
    });
    await tx.balance.update({
      where: {
        userId: Number(recipient),
      },
      data: {
        amount: {
          increment: amount * 100,
        },
      },
    });
  });
};

export default p2pTransfer;
