import { Card } from "@repo/ui/card";
import { getServerSession } from "next-auth";
import { authOptions } from "../app/lib/auth";

export const P2PTransactions = async ({
  transactions,
}: {
  transactions: {
    time: Date;
    amount: number;
    fromUserId: number;
    toUserId: number;
  }[];
}) => {
  const session = await getServerSession(authOptions);

  if (!transactions.length) {
    return (
      <Card title="Recent Transactions">
        <div className="text-center pb-8 pt-8">No Recent transactions</div>
      </Card>
    );
  }
  return (
    <Card title="Recent Transactions">
      <div className="pt-2">
        {transactions.map((t) => {
          const value =
            t.fromUserId === session?.user.id ? "SPENT INR" : "Received INR";
          const sign = t.fromUserId === session?.user.id ? "-" : "+";
          return (
            <div className="flex justify-between" key={t.time.toISOString()}>
              <div>
                <div className="text-sm">{value}</div>
                <div className="text-slate-600 text-xs">
                  {t.time.toDateString()}
                </div>
              </div>
              <div className="flex flex-col justify-center">
                {sign} Rs {t.amount / 100}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
