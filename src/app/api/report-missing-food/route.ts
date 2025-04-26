import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db"; 
import MissingFood from "@/models/MissingFood"; 

export async function POST(req: Request) {
  await connectDB(); // Ensure DB connection before proceeding

  try {
    // Parse request body safely
    const body = await req.json().catch(() => null);
    if (!body || !body.foodName || body.foodName.trim() === "") {
      return NextResponse.json({ error: "Food name is required" }, { status: 400 });
    }

    // Create new food entry with extra fields
    const newFood = new MissingFood({
      name: body.foodName,
      category: body.category || "Unknown",
      brand: body.brand || "",
      packagingType: body.packagingType || "",
      ingredients: body.ingredients || [],
      description: body.description || "User-reported missing food",
    });

    await newFood.save();

    return NextResponse.json({ message: "Food added successfully!" }, { status: 201 });
  } catch (error: any) {
    console.error("Error submitting food:", error.message || error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
