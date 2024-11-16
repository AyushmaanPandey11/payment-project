import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { Center } from "@repo/ui/center";
import { P2PTransactions } from "../../../components/P2PTransactions";

const getP2pTransactions = async () => {
  const session = await getServerSession(authOptions);
  const transactions = await prisma.p2pTransfer.findMany({
    where: {
      OR: [{ fromUserId: session?.user?.id }, { toUserId: session?.user?.id }],
    },
  });
  return transactions.map((t) => ({
    time: t.timestamp,
    amount: t.amount,
    fromUserId: t.fromUserId,
    toUserId: t.toUserId,
  }));
};

export default async function () {
  const transactions = await getP2pTransactions();
  return (
    <div>
      P2P Transactions History
      <Center>
        <P2PTransactions transactions={transactions} />
      </Center>
    </div>
  );
}
