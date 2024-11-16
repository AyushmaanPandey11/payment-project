"user server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";

const createOnRampTransaction = async (amount: number, provider: string) => {
  const session = await getServerSession(authOptions);
  // token comes from bank about which user this transaction belongs to
  const token = Math.random().toString();
  const userId = session.user.id;
  if (!userId) {
    return {
      message: "User not Logged in",
    };
  }
  await prisma.onRampTransaction.create({
    data: {
      userId: Number(userId),
      amount: amount,
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
