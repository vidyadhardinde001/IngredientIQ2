// api/user/profile.ts

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db"; // Import the specific function
import User from "@/models/User";
import type { NextRequest } from "next/server";

interface UserProfileResponse {
  username: string;
  email: string;
  age?: number;
  gender?: string;
  healthConditions?: string[];
  dietaryPreferences?: string[];
  allergies?: string[];
  foodSuggestions?: string[];
}

export async function GET(req: NextRequest) {
  try {
    // Connect to database using the proper function
    await connectDB();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - Token missing or invalid format" },
        { status: 401 }
      );
    }

    const authToken = authHeader.split(" ")[1];
    const user = await User.findOne({ authToken }).select("-password -__v -authToken");
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const responseData: UserProfileResponse = {
      username: user.username,
      email: user.email,
      ...(user.age && { age: user.age }),
      ...(user.gender && { gender: user.gender }),
      ...(user.healthConditions && { healthConditions: user.healthConditions }),
      ...(user.dietaryPreferences && { dietaryPreferences: user.dietaryPreferences }),
      ...(user.allergies && { allergies: user.allergies }),
      foodSuggestions: user.foodSuggestions || [],
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Profile API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}