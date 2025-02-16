import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(req: Request) {
  await dbConnect();

  const body = await req.json();
  const { email, ...updatedData } = body;

  const user = await User.findOneAndUpdate({ email }, updatedData, { new: true });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json(user);
}
