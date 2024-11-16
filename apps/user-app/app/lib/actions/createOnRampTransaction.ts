"user server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";
import { ApiError } from "next/dist/server/api-utils";

const createOnRampTransaction = async (amount: number, provider: string) => {
  const session = await getServerSession(authOptions);
  // token comes from bank about which user this transaction belongs to
  const token = Math.random().toString();
  const userId = session.user.id;
  if (!userId) {
    throw new ApiError(411, "UnAuthorized Access");
  }
  await prisma.onRampTransaction.create({
    data: {
      userId: Number(userId),
      amount: amount * 100,
      status: "Processing",
      startTime: new Date(),
      provider: provider,
      token: token,
    },
  });
  return {
    message: "On Ramp Transaction added",
  };
};

export default createOnRampTransaction;
