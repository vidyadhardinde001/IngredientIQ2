import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { foodName } = await req.json();

    if (!foodName) {
      return NextResponse.json({ message: "Food name is required" }, { status: 400 });
    }

    // OpenAI request
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use gpt-4 if you have access
      messages: [
        {
          role: "system",
          content: "You are a helpful food information assistant that rates food based on age groups.",
        },
        {
          role: "user",
          content: `Please provide a description of the food item "${foodName}". Along with the description, provide ratings for different age groups:
            - Rating for Children (ages 5-12) based on its health benefits, taste, and safety.
            - Rating for Adults (ages 18-50) based on its nutritional value, health benefits, and versatility.
            - Rating for Seniors (ages 65+) based on its ease of digestion, nutritional benefits, and suitability for senior health.
            
            Make sure to include the rationale for each rating, such as the nutrients it provides and why it is suitable or unsuitable for each group.`
        },
      ],
    });

    const message = completion.choices[0]?.message?.content?.trim();

    if (message) {
      // Return the detailed response including the ratings and description
      return NextResponse.json({
        info: message,
      });
    } else {
      return NextResponse.json({ message: "No relevant information found" }, { status: 404 });
    }
  } catch (error: any) {
    console.error("OpenAI Error:", error);
    return NextResponse.json({ message: "Failed to get information from AI" }, { status: 500 });
  }
}