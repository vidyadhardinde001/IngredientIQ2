import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET(req: Request) {
  await dbConnect();

  const authToken = req.headers.get("Authorization")?.split(" ")[1];
  if (!authToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await User.findOne({ authToken });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    username: user.username,
    email: user.email,
    age: user.age,
    gender: user.gender,
    healthConditions: user.healthConditions,
    dietaryPreferences: user.dietaryPreferences,
    allergies: user.allergies,
    foodSuggestions: user.foodSuggestions || [],
  });
}
