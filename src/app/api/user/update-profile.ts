// api/user/profile.ts

import { NextResponse } from "next/server";
import db from "@/lib/db"; // Import from your db.ts file
import type { NextRequest } from "next/server";

interface UpdateUserData {
  email: string;
  username?: string;
  age?: number;
  gender?: string;
  healthConditions?: string[];
  dietaryPreferences?: string[];
  allergies?: string[];
  foodSuggestions?: string[];
}

export async function POST(req: NextRequest) {
  try {
    // Connect to database using the connectDB method from your db.ts
    await db.connectDB();

    // Validate request content type
    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid content type, expected application/json" },
        { status: 415 }
      );
    }

    const body = await req.json();
    
    // Validate required fields
    if (!body.email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const { email, ...updatedData } = body;

    // Validate no sensitive fields are being updated
    const allowedFields = [
      'username', 'age', 'gender', 
      'healthConditions', 'dietaryPreferences', 
      'allergies', 'foodSuggestions'
    ];
    
    const invalidFields = Object.keys(updatedData).filter(
      field => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return NextResponse.json(
        { error: `Cannot update restricted fields: ${invalidFields.join(', ')}` },
        { status: 403 }
      );
    }

    // Update user using ProfileModel from your db.ts
    const user = await db.ProfileModel.findOneAndUpdate(
      { email },
      updatedData,
      { 
        new: true,
        runValidators: true // Ensure updates follow schema validation
      }
    ).select('-__v'); // Exclude version key (password and authToken aren't in your schema)

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prepare response data according to your ProfileSchema
    const responseData = {
      message: "User updated successfully",
      user: {
        name: user.name, // Using name instead of username to match your schema
        email: user.email,
        ...(user.age && { age: user.age }),
        ...(user.gender && { gender: user.gender }),
        ...(user.weight && { weight: user.weight }),
        ...(user.height && { height: user.height }),
        conditions: user.conditions || [],
        dietaryPreferences: user.dietaryPreferences || [],
        ...(user.allergies && { allergies: user.allergies }),
        ...(user.familyMembers && { familyMembers: user.familyMembers }),
        ...(user.nutritionGoals && { nutritionGoals: user.nutritionGoals }),
        foodSuggestions: user.foodSuggestions || []
      }
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Update User Error:", error);
    
    // Handle Mongoose validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    

    // Handle duplicate key errors
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 11000) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }
    

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}