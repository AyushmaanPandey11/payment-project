import { NextResponse } from "next/server";
import db from "@repo/db/client";

export const dynamic = "force-dynamic";

export const GET = async () => {
  console.log("testing cicid");
  try {
    await db.user.create({
      data: {
        email: "asd" + Math.random(),
        name: "adsads",
        number: "+911234567890",
        password: "123445566",
      },
    });

    return NextResponse.json({
      message: "hi there",
    });
  } catch (e) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
};
