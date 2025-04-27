// app/api/product-info/substitutes/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    const { productName, healthIssues, allergies } = await request.json();

  try {
    console.log("HealthIssues: ", healthIssues);
    console.log("Allergies: ", allergies);
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: `Suggest 5 safe alternative products for "${productName}" considering these health restrictions: 
          - Health issues: ${healthIssues.join(', ') || 'none'}
          - Allergies: ${allergies.join(', ') || 'none'}
          Return only a JSON array of product names that avoid problematic ingredients, no other text.
          Example: ["Product 1", "Product 2"]`
        }],
      });

    const responseText = completion.choices[0]?.message?.content || '[]';
    
    // Safely parse the response
    let substitutes: string[] = [];
    try {
      substitutes = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, ''));
    } catch (error) {
      console.error('Error parsing ChatGPT response:', error);
    }

    return NextResponse.json({ substitutes });
  } catch (error: any) {
    console.error('ChatGPT API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get substitutes' },
      { status: 500 }
    );
  }
}